package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PedidoRequest(
        @NotNull(message = "Completa los datos del cliente") @Valid ClienteDto cliente,
        @NotEmpty(message = "Tu carrito está vacío.") List<@Valid ItemPedidoRequest> items) {
}
