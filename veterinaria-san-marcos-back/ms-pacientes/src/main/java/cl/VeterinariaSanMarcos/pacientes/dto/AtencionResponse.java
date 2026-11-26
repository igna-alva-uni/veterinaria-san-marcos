package cl.VeterinariaSanMarcos.pacientes.dto;

import cl.VeterinariaSanMarcos.commons.util.Fechas;
import cl.VeterinariaSanMarcos.pacientes.entity.AtencionClinica;

import java.time.LocalDate;

public record AtencionResponse(
        Long id,
        LocalDate fecha,
        String tipo,
        String diagnostico,
        String medicamento,
        String observacion,
        LocalDate proximoControl,
        Long idVeterinario,
        VacunaDto vacuna) {

    public static AtencionResponse desde(AtencionClinica a) {
        VacunaDto vacuna = a.getVacuna() == null ? null
                : new VacunaDto(a.getVacuna().getId(), a.getVacuna().getNombreVacuna(), a.getVacuna().getFechaVencimiento());
        return new AtencionResponse(a.getId(), Fechas.fecha(a.getFechaAtencion()), a.getMotivo(), a.getDiagnostico(),
                a.getTratamientoMedicamentos(), a.getIndicaciones(), a.getProximoControl(), a.getIdVeterinario(), vacuna);
    }
}
