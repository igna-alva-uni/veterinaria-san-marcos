package cl.VeterinariaSanMarcos.pacientes.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record VacunaDto(Long id, @Size(max = 50) String nombre, LocalDate vencimiento) {
}
