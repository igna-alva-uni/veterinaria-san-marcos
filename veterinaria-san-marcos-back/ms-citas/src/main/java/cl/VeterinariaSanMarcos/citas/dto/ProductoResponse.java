package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.Producto;

public record ProductoResponse(
        String codigo,
        String tipo,
        String nombre,
        String categoria,
        String principioActivo,
        String presentacion,
        String especie,
        Integer stock,
        Long precio,
        boolean activo) {

    public static ProductoResponse desde(Producto p) {
        return new ProductoResponse(p.getCodigo(), "producto", p.getNombre(), p.getCategoria(), p.getPrincipioActivo(),
                p.getPresentacion(), p.getEspeciePermitida(), p.getStock(), p.getPrecio().longValue(), p.isActivo());
    }
}
