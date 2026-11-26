package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.Cita;
import cl.VeterinariaSanMarcos.commons.util.Fechas;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/** Fecha y hora se devuelven separadas en hora de Chile, igual que las maneja el frontend. */
public record CitaResponse(
        Long id,
        Long mascotaId,
        Long duenoId,
        String codigoServicio,
        String servicio,
        LocalDate fecha,
        String hora,
        Integer duracionMinutos,
        Long precio,
        String estado,
        String pagoEstado,
        String motivo,
        Long idVeterinario,
        Instant creadaEn) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public static CitaResponse desde(Cita c) {
        return new CitaResponse(c.getId(), c.getIdPaciente(), c.getIdDueno(), c.getServicio().getCodigo(),
                c.getServicio().getNombre(), Fechas.fecha(c.getFechaHora()), Fechas.hora(c.getFechaHora()).format(HORA),
                c.getDuracionMinutos(), c.getPrecioAcordado().longValue(), c.getEstado().name(), c.getPagoEstado().name(),
                c.getComentarios() == null ? "" : c.getComentarios(), c.getIdVeterinario(), c.getFechaCreacion());
    }
}
