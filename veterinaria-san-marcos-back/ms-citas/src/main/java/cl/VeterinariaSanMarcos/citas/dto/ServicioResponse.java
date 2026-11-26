package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.ServicioCatalogo;

public record ServicioResponse(
        String codigo,
        String tipo,
        String nombre,
        String categoria,
        String especie,
        Integer duracionMinutos,
        String duracion,
        Long precio,
        String observaciones,
        boolean activo) {

    public static ServicioResponse desde(ServicioCatalogo s) {
        return new ServicioResponse(s.getCodigo(), "servicio", s.getNombre(), s.getCategoria(), s.getEspeciePermitida(),
                s.getDuracionMinutos(), duracionTexto(s.getDuracionMinutos()), s.getPrecio().longValue(),
                s.getComentarios() == null ? "" : s.getComentarios(), s.isActivo());
    }

    static String duracionTexto(int minutos) {
        if (minutos >= 120 && minutos % 60 == 0) {
            int horas = minutos / 60;
            return horas + " horas";
        }
        return minutos + " min";
    }
}
