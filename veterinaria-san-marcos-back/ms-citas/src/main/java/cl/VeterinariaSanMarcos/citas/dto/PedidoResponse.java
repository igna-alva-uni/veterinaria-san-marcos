package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.Pedido;

import java.time.Instant;
import java.util.List;

public record PedidoResponse(
        Long id,
        String numero,
        Instant fecha,
        Long idUsuario,
        ClienteDto cliente,
        List<ItemPedidoResponse> items,
        Long subtotalProductos,
        Long subtotalServicios,
        Long total,
        String estado) {

    public static PedidoResponse desde(Pedido p) {
        var cliente = new ClienteDto(p.getNombreCliente(), p.getCorreoCliente(), p.getTelefonoCliente(),
                p.getDireccion(), p.getComuna(), p.getObservaciones());
        return new PedidoResponse(p.getId(), p.getNumero(), p.getFechaCreacion(), p.getIdUsuario(), cliente,
                p.getDetalles().stream().map(ItemPedidoResponse::desde).toList(),
                p.getSubtotalProductos().longValue(), p.getSubtotalServicios().longValue(), p.getTotal().longValue(),
                p.getEstado().name());
    }
}
