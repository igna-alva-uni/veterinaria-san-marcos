package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.PedidoDetalle;

public record ItemPedidoResponse(String tipo, String codigo, String nombre, Long precioUnitario, Integer cantidad, Long subtotal) {

    public static ItemPedidoResponse desde(PedidoDetalle d) {
        return new ItemPedidoResponse(d.getTipoItem().name(), d.getCodigoItem(), d.getNombreItem(),
                d.getPrecioUnitario().longValue(), d.getCantidad(), d.getSubtotal().longValue());
    }
}
