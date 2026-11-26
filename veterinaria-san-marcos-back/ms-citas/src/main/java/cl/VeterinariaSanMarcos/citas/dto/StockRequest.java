package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record StockRequest(@NotNull(message = "Ingresa el stock") @PositiveOrZero(message = "El stock no puede ser negativo") Integer stock) {
}
