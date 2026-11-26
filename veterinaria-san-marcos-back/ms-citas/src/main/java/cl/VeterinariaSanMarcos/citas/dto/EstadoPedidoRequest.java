package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record EstadoPedidoRequest(@NotNull(message = "Indica el nuevo estado") EstadoPedido estado) {
}
