package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.TipoItem;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** El cliente solo envía qué y cuánto; el precio siempre lo pone el backend. */
public record ItemPedidoRequest(
        @NotNull(message = "Indica el tipo de ítem") TipoItem tipo,
        @NotBlank(message = "Indica el código del ítem") String codigo,
        @NotNull @Min(value = 1, message = "La cantidad mínima es 1") @Max(value = 99, message = "La cantidad máxima es 99") Integer cantidad) {
}
