package cl.VeterinariaSanMarcos.pacientes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Datos de una mascota. Se acepta la edad en años (como en el formulario del frontend)
 * o la fecha de nacimiento; la base guarda la fecha. idDueno solo lo usa el personal.
 */
public record PacienteRequest(
        @NotBlank(message = "Ingresa el nombre de la mascota") @Size(max = 50, message = "El nombre admite hasta 50 caracteres") String nombre,
        @NotBlank(message = "Selecciona una especie válida") @Size(max = 30) String especie,
        @Size(max = 50, message = "La raza admite hasta 50 caracteres") String raza,
        @Min(value = 0, message = "La edad debe estar entre 0 y 40 años") @Max(value = 40, message = "La edad debe estar entre 0 y 40 años") Integer edad,
        @PastOrPresent(message = "La fecha de nacimiento no puede ser futura") LocalDate fechaNacimiento,
        @DecimalMin(value = "0.01", message = "El peso debe ser mayor a 0") @DecimalMax(value = "999.99") BigDecimal pesoKg,
        String sexo,
        Long idDueno,
        String observaciones) {
}
