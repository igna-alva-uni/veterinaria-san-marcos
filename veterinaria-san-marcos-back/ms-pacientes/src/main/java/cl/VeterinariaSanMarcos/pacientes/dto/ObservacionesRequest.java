package cl.VeterinariaSanMarcos.pacientes.dto;

import jakarta.validation.constraints.Size;

public record ObservacionesRequest(@Size(max = 2000, message = "Las observaciones admiten hasta 2000 caracteres") String observaciones) {
}
