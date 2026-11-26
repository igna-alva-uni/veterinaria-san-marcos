package cl.VeterinariaSanMarcos.pacientes.dto;

import cl.VeterinariaSanMarcos.commons.util.Fechas;
import cl.VeterinariaSanMarcos.pacientes.entity.Paciente;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/** Incluye el historial para que las vistas de ficha y avisos de vacunas no necesiten otra petición. */
public record PacienteResponse(
        Long id,
        String nombre,
        String especie,
        String raza,
        Integer edad,
        LocalDate fechaNacimiento,
        BigDecimal pesoKg,
        String sexo,
        Long duenoId,
        String observaciones,
        Instant fechaRegistro,
        List<AtencionResponse> historial) {

    public static PacienteResponse desde(Paciente p) {
        Integer edad = p.getFechaNacimiento() == null ? null
                : Period.between(p.getFechaNacimiento(), Fechas.hoy()).getYears();
        return new PacienteResponse(p.getId(), p.getNombre(), p.getEspecie(), p.getRaza(), edad,
                p.getFechaNacimiento(), p.getPesoKg(), sexoTexto(p.getGenero()), p.getIdDueno(), p.getAnotaciones(),
                p.getFechaRegistro(), p.getAtenciones().stream().map(AtencionResponse::desde).toList());
    }

    static String sexoTexto(Character genero) {
        if (genero == null) return "No especificado";
        return genero == 'M' ? "Macho" : "Hembra";
    }
}
