package cl.VeterinariaSanMarcos.usuarios.dto;

import jakarta.validation.constraints.NotNull;

public record EstadoRequest(@NotNull(message = "Indica si el usuario queda activo") Boolean activo) {
}
