package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReprogramarRequest(
        @NotNull(message = "Selecciona la nueva fecha y el nuevo horario.") LocalDate fecha,
        @NotNull(message = "Selecciona la nueva fecha y el nuevo horario.") LocalTime hora) {
}
