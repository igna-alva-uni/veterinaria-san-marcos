package cl.VeterinariaSanMarcos.pacientes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Nombres de campos iguales a los del formulario de ficha clínica del frontend. */
public record AtencionRequest(
        @NotNull(message = "La fecha debe ser válida y no futura") @PastOrPresent(message = "La fecha debe ser válida y no futura") LocalDate fecha,
        @Size(max = 255) String tipo,
        @NotBlank(message = "Ingresa el diagnóstico") String diagnostico,
        String medicamento,
        String observacion,
        LocalDate proximoControl,
        @Valid VacunaDto vacuna) {
}
