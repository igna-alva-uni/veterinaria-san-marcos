package cl.VeterinariaSanMarcos.pacientes.service;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.commons.security.UsuarioAutenticado;
import cl.VeterinariaSanMarcos.commons.util.Fechas;
import cl.VeterinariaSanMarcos.pacientes.client.CitasClient;
import cl.VeterinariaSanMarcos.pacientes.dto.AtencionRequest;
import cl.VeterinariaSanMarcos.pacientes.dto.AtencionResponse;
import cl.VeterinariaSanMarcos.pacientes.dto.PacienteRequest;
import cl.VeterinariaSanMarcos.pacientes.dto.PacienteResponse;
import cl.VeterinariaSanMarcos.pacientes.entity.AtencionClinica;
import cl.VeterinariaSanMarcos.pacientes.entity.Paciente;
import cl.VeterinariaSanMarcos.pacientes.entity.Vacuna;
import cl.VeterinariaSanMarcos.pacientes.repository.AtencionRepository;
import cl.VeterinariaSanMarcos.pacientes.repository.PacienteRepository;
import cl.VeterinariaSanMarcos.pacientes.repository.VacunaRepository;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class PacienteService {

    public static final Set<String> ESPECIES = Set.of("Perro", "Gato", "Conejo", "Ave", "Otro");

    private final PacienteRepository pacientes;
    private final AtencionRepository atenciones;
    private final VacunaRepository vacunas;
    private final CitasClient citasClient;

    public PacienteService(PacienteRepository pacientes, AtencionRepository atenciones,
                           VacunaRepository vacunas, CitasClient citasClient) {
        this.pacientes = pacientes;
        this.atenciones = atenciones;
        this.vacunas = vacunas;
        this.citasClient = citasClient;
    }

    /** El personal ve todas las mascotas (o las de un dueño); un dueño solo ve las suyas. */
    @Transactional(readOnly = true)
    public List<PacienteResponse> listar(UsuarioAutenticado actual, Long idDueno) {
        List<Paciente> resultado;
        if (actual.esPersonal()) {
            resultado = idDueno == null ? pacientes.findAllByOrderByNombreAsc() : pacientes.findByIdDuenoOrderByNombreAsc(idDueno);
        } else {
            resultado = pacientes.findByIdDuenoOrderByNombreAsc(actual.id());
        }
        return resultado.stream().map(PacienteResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public PacienteResponse obtener(Long id, UsuarioAutenticado actual) {
        return PacienteResponse.desde(buscarVisible(id, actual));
    }

    @Transactional
    public PacienteResponse crear(PacienteRequest solicitud, UsuarioAutenticado actual) {
        Long idDueno;
        if (actual.esDueno()) {
            idDueno = actual.id(); // un dueño siempre registra a su nombre, ignore lo que envíe
        } else {
            if (solicitud.idDueno() == null || solicitud.idDueno() <= 0) {
                throw ApiException.solicitudInvalida("Selecciona un dueño");
            }
            idDueno = solicitud.idDueno();
        }
        Paciente paciente = new Paciente();
        paciente.setIdDueno(idDueno);
        aplicarDatos(paciente, solicitud);
        paciente.setAnotaciones(textoOpcional(solicitud.observaciones()));
        return PacienteResponse.desde(pacientes.save(paciente));
    }

    @Transactional
    public PacienteResponse actualizar(Long id, PacienteRequest solicitud, UsuarioAutenticado actual) {
        Paciente paciente = buscarVisible(id, actual);
        aplicarDatos(paciente, solicitud);
        // Solo administración o recepción pueden reasignar la mascota a otro dueño.
        if (actual.tieneRol(UsuarioAutenticado.ADMINISTRADOR, UsuarioAutenticado.RECEPCIONISTA)
                && solicitud.idDueno() != null && solicitud.idDueno() > 0) {
            paciente.setIdDueno(solicitud.idDueno());
        }
        if (solicitud.observaciones() != null && actual.esPersonal()) {
            paciente.setAnotaciones(textoOpcional(solicitud.observaciones()));
        }
        return PacienteResponse.desde(paciente);
    }

    @Transactional
    public PacienteResponse actualizarObservaciones(Long id, String observaciones, UsuarioAutenticado actual) {
        Paciente paciente = buscarVisible(id, actual);
        paciente.setAnotaciones(textoOpcional(observaciones));
        return PacienteResponse.desde(paciente);
    }

    /**
     * Regla de negocio: no se elimina una mascota con citas activas. Se consulta a ms-citas;
     * si no responde, la eliminación se rechaza en vez de arriesgar datos inconsistentes.
     */
    @Transactional
    public void eliminar(Long id, UsuarioAutenticado actual) {
        Paciente paciente = buscarVisible(id, actual);
        if (actual.tieneRol(UsuarioAutenticado.VETERINARIO)) {
            throw ApiException.prohibido("Tu rol no puede eliminar mascotas.");
        }
        boolean tieneCitasActivas;
        try {
            tieneCitasActivas = !citasClient.citasActivasDePaciente(id, true).isEmpty();
        } catch (FeignException e) {
            throw ApiException.servicioNoDisponible("No se pudo verificar las citas de la mascota. Intenta nuevamente.");
        }
        if (tieneCitasActivas) {
            throw ApiException.conflicto("Cancela las citas activas antes de eliminar esta mascota.");
        }
        vacunas.eliminarSueltasDePaciente(id);
        pacientes.delete(paciente);
    }

    @Transactional(readOnly = true)
    public List<AtencionResponse> listarAtenciones(Long idPaciente, UsuarioAutenticado actual) {
        return buscarVisible(idPaciente, actual).getAtenciones().stream().map(AtencionResponse::desde).toList();
    }

    @Transactional
    public AtencionResponse registrarAtencion(Long idPaciente, AtencionRequest solicitud, UsuarioAutenticado actual) {
        Paciente paciente = buscar(idPaciente);
        LocalDate fecha = solicitud.fecha();
        if (fecha.isAfter(Fechas.hoy())) {
            throw ApiException.solicitudInvalida("La fecha debe ser válida y no futura");
        }
        if (solicitud.proximoControl() != null && solicitud.proximoControl().isBefore(fecha)) {
            throw ApiException.solicitudInvalida("El próximo control no puede ser anterior a la atención");
        }
        AtencionClinica atencion = new AtencionClinica();
        atencion.setPaciente(paciente);
        atencion.setIdVeterinario(actual.id());
        atencion.setFechaAtencion(Fechas.aInstante(fecha, LocalTime.NOON));
        atencion.setMotivo(textoOpcional(solicitud.tipo()) == null ? "Consulta" : solicitud.tipo().trim());
        atencion.setDiagnostico(solicitud.diagnostico().trim());
        atencion.setTratamientoMedicamentos(textoOpcional(solicitud.medicamento()));
        atencion.setIndicaciones(textoOpcional(solicitud.observacion()));
        atencion.setProximoControl(solicitud.proximoControl());

        var datosVacuna = solicitud.vacuna();
        if (datosVacuna != null && textoOpcional(datosVacuna.nombre()) != null) {
            if (datosVacuna.vencimiento() == null || !datosVacuna.vencimiento().isAfter(fecha)) {
                throw ApiException.solicitudInvalida("Ingresa un vencimiento de vacuna válido y posterior a su aplicación");
            }
            Vacuna vacuna = new Vacuna();
            vacuna.setPaciente(paciente);
            vacuna.setAtencion(atencion);
            vacuna.setNombreVacuna(datosVacuna.nombre().trim());
            vacuna.setFechaAplicacion(fecha);
            vacuna.setFechaVencimiento(datosVacuna.vencimiento());
            atencion.setVacuna(vacuna);
        } else if (datosVacuna != null && datosVacuna.vencimiento() != null) {
            throw ApiException.solicitudInvalida("Ingresa el nombre de la vacuna aplicada");
        }
        paciente.getAtenciones().add(atencion);
        return AtencionResponse.desde(atenciones.save(atencion));
    }

    @Transactional
    public void eliminarAtencion(Long idPaciente, Long idAtencion) {
        AtencionClinica atencion = atenciones.findByIdAndPacienteId(idAtencion, idPaciente)
                .orElseThrow(() -> ApiException.noEncontrado("No se encontró la atención indicada."));
        atencion.getPaciente().getAtenciones().remove(atencion); // orphanRemoval borra la atención y su vacuna
    }

    private void aplicarDatos(Paciente paciente, PacienteRequest solicitud) {
        String especie = solicitud.especie().trim();
        if (!ESPECIES.contains(especie)) {
            throw ApiException.solicitudInvalida("Selecciona una especie válida");
        }
        paciente.setNombre(solicitud.nombre().trim());
        paciente.setEspecie(especie);
        paciente.setRaza(textoOpcional(solicitud.raza()));
        if (solicitud.fechaNacimiento() != null) {
            paciente.setFechaNacimiento(solicitud.fechaNacimiento());
        } else if (solicitud.edad() != null) {
            paciente.setFechaNacimiento(Fechas.hoy().minusYears(solicitud.edad()));
        } else if (paciente.getFechaNacimiento() == null) {
            throw ApiException.solicitudInvalida("La edad debe estar entre 0 y 40 años");
        }
        if (solicitud.pesoKg() != null) {
            paciente.setPesoKg(solicitud.pesoKg());
        }
        if (solicitud.sexo() != null) {
            paciente.setGenero(generoDesde(solicitud.sexo()));
        }
    }

    static Character generoDesde(String sexo) {
        return switch (sexo.trim().toUpperCase()) {
            case "M", "MACHO" -> 'M';
            case "F", "H", "HEMBRA" -> 'F';
            default -> null;
        };
    }

    /** Busca y verifica que el usuario pueda acceder: personal o dueño de la mascota. */
    private Paciente buscarVisible(Long id, UsuarioAutenticado actual) {
        Paciente paciente = buscar(id);
        if (!actual.esPersonal() && !Objects.equals(paciente.getIdDueno(), actual.id())) {
            throw ApiException.prohibido("No tienes permiso para acceder a esta mascota.");
        }
        return paciente;
    }

    private Paciente buscar(Long id) {
        return pacientes.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró la mascota."));
    }

    private static String textoOpcional(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
