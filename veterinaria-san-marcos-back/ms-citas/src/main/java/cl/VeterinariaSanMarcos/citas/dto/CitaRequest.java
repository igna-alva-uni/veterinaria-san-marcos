package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record CitaRequest(
        @NotNull(message = "Selecciona una mascota registrada.") Long idPaciente,
        @NotBlank(message = "Selecciona un servicio.") String codigoServicio,
        @NotNull(message = "Selecciona una fecha válida igual o posterior a hoy.") LocalDate fecha,
        @NotNull(message = "Selecciona un horario válido.") LocalTime hora,
        @Size(max = 500, message = "El motivo admite hasta 500 caracteres") String motivo) {
}
