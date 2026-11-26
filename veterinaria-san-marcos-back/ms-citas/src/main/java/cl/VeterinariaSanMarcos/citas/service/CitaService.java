package cl.VeterinariaSanMarcos.citas.service;

import cl.VeterinariaSanMarcos.citas.client.PacientesClient;
import cl.VeterinariaSanMarcos.citas.dto.CitaRequest;
import cl.VeterinariaSanMarcos.citas.dto.CitaResponse;
import cl.VeterinariaSanMarcos.citas.entity.Cita;
import cl.VeterinariaSanMarcos.citas.entity.EstadoCita;
import cl.VeterinariaSanMarcos.citas.entity.ServicioCatalogo;
import cl.VeterinariaSanMarcos.citas.repository.CitaRepository;
import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.commons.security.UsuarioAutenticado;
import cl.VeterinariaSanMarcos.commons.util.Fechas;
import feign.FeignException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class CitaService {

    /** Bloques de atención disponibles (los mismos que ofrece el formulario del frontend). */
    public static final List<LocalTime> HORARIOS = Stream.of("09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00")
            .map(LocalTime::parse).toList();

    private static final String HORARIO_OCUPADO = "Ese horario ya tiene una solicitud activa.";

    private final CitaRepository citas;
    private final CatalogoService catalogo;
    private final PacientesClient pacientesClient;

    public CitaService(CitaRepository citas, CatalogoService catalogo, PacientesClient pacientesClient) {
        this.citas = citas;
        this.catalogo = catalogo;
        this.pacientesClient = pacientesClient;
    }

    /** Personal: todas las citas. Dueño: solo las propias. Filtros opcionales por mascota y vigencia. */
    @Transactional(readOnly = true)
    public List<CitaResponse> listar(UsuarioAutenticado actual, Long idPaciente, boolean soloActivas) {
        List<Cita> lista = actual.esPersonal() ? citas.findAllByOrderByFechaHoraAsc()
                : citas.findByIdDuenoOrderByFechaHoraAsc(actual.id());
        return lista.stream()
                .filter(c -> idPaciente == null || Objects.equals(c.getIdPaciente(), idPaciente))
                .filter(c -> !soloActivas || c.estaActiva())
                .map(CitaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public CitaResponse obtener(Long id, UsuarioAutenticado actual) {
        return CitaResponse.desde(buscarVisible(id, actual));
    }

    /**
     * Flujo: valida horario → valida que el servicio exista y esté activo → consulta la mascota
     * en ms-pacientes (con el token del usuario) → verifica especie y disponibilidad → guarda.
     */
    @Transactional
    public CitaResponse crear(CitaRequest solicitud, UsuarioAutenticado actual) {
        validarHorario(solicitud.fecha(), solicitud.hora());
        ServicioCatalogo servicio = catalogo.buscarServicio(solicitud.codigoServicio());
        if (!servicio.isActivo()) {
            throw ApiException.solicitudInvalida("El servicio seleccionado no está disponible.");
        }
        PacientesClient.PacienteResumen mascota = obtenerMascota(solicitud.idPaciente());
        if (actual.esDueno() && !Objects.equals(mascota.duenoId(), actual.id())) {
            throw ApiException.prohibido("Solo puedes solicitar citas para tus mascotas.");
        }
        if (!servicio.admiteEspecie(mascota.especie())) {
            throw ApiException.solicitudInvalida("El servicio " + servicio.getNombre() + " es solo para "
                    + servicio.getEspeciePermitida() + ".");
        }
        Instant fechaHora = Fechas.aInstante(solicitud.fecha(), solicitud.hora());
        if (citas.existsByFechaHoraAndEstadoNot(fechaHora, EstadoCita.CANCELADA)) {
            throw ApiException.conflicto(HORARIO_OCUPADO);
        }
        Cita cita = new Cita();
        cita.setFechaHora(fechaHora);
        cita.setServicio(servicio);
        cita.setDuracionMinutos(servicio.getDuracionMinutos());
        cita.setPrecioAcordado(servicio.getPrecio());
        cita.setIdPaciente(mascota.id());
        cita.setIdDueno(mascota.duenoId());
        cita.setComentarios(solicitud.motivo() == null || solicitud.motivo().isBlank() ? null : solicitud.motivo().trim());
        cita.setEstado(EstadoCita.SOLICITADA);
        return CitaResponse.desde(citas.save(cita));
    }

    /**
     * El personal confirma, cancela o completa. Un dueño solo puede cancelar sus propias citas.
     */
    @Transactional
    public CitaResponse cambiarEstado(Long id, EstadoCita nuevo, UsuarioAutenticado actual) {
        Cita cita = buscarVisible(id, actual);
        if (actual.esDueno() && nuevo != EstadoCita.CANCELADA) {
            throw ApiException.prohibido("Solo recepción o administración puede cambiar el estado.");
        }
        if (cita.getEstado() == EstadoCita.COMPLETADA || cita.getEstado() == EstadoCita.CANCELADA) {
            throw ApiException.conflicto("La cita ya está " + cita.getEstado().name().toLowerCase() + " y no se puede modificar.");
        }
        if (nuevo != EstadoCita.CANCELADA
                && citas.existsByFechaHoraAndEstadoNotAndIdNot(cita.getFechaHora(), EstadoCita.CANCELADA, id)) {
            throw ApiException.conflicto(HORARIO_OCUPADO);
        }
        if (nuevo == EstadoCita.COMPLETADA && cita.getIdVeterinario() == null) {
            cita.setIdVeterinario(actual.id());
        }
        cita.setEstado(nuevo);
        return CitaResponse.desde(cita);
    }

    /** Reagendar deja la cita pendiente de una nueva confirmación. */
    @Transactional
    public CitaResponse reprogramar(Long id, LocalDate fecha, LocalTime hora, UsuarioAutenticado actual) {
        Cita cita = buscarVisible(id, actual);
        if (!cita.estaActiva()) {
            throw ApiException.conflicto("Solo se pueden reprogramar citas activas.");
        }
        validarHorario(fecha, hora);
        Instant fechaHora = Fechas.aInstante(fecha, hora);
        if (citas.existsByFechaHoraAndEstadoNotAndIdNot(fechaHora, EstadoCita.CANCELADA, id)) {
            throw ApiException.conflicto(HORARIO_OCUPADO);
        }
        cita.setFechaHora(fechaHora);
        cita.setEstado(EstadoCita.SOLICITADA);
        return CitaResponse.desde(cita);
    }

    @Transactional
    public void eliminar(Long id) {
        Cita cita = citas.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró la cita."));
        citas.delete(cita);
    }

    static void validarHorario(LocalDate fecha, LocalTime hora) {
        if (fecha == null || fecha.isBefore(Fechas.hoy())) {
            throw ApiException.solicitudInvalida("Selecciona una fecha válida igual o posterior a hoy.");
        }
        if (hora == null || !HORARIOS.contains(hora.withSecond(0).withNano(0))) {
            throw ApiException.solicitudInvalida("Selecciona un horario válido.");
        }
        if (Fechas.aInstante(fecha, hora).isBefore(Instant.now())) {
            throw ApiException.solicitudInvalida("Ese horario ya pasó. Elige uno posterior.");
        }
    }

    private PacientesClient.PacienteResumen obtenerMascota(Long idPaciente) {
        try {
            return pacientesClient.obtener(idPaciente);
        } catch (FeignException.NotFound e) {
            throw ApiException.solicitudInvalida("Selecciona una mascota registrada.");
        } catch (FeignException.Forbidden e) {
            throw ApiException.prohibido("Solo puedes solicitar citas para tus mascotas.");
        } catch (FeignException e) {
            throw ApiException.servicioNoDisponible("No se pudo validar la mascota en este momento. Intenta nuevamente.");
        }
    }

    private Cita buscarVisible(Long id, UsuarioAutenticado actual) {
        Cita cita = citas.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró la cita."));
        if (!actual.esPersonal() && !Objects.equals(cita.getIdDueno(), actual.id())) {
            throw ApiException.prohibido("No tienes permiso para acceder a esta cita.");
        }
        return cita;
    }
}
