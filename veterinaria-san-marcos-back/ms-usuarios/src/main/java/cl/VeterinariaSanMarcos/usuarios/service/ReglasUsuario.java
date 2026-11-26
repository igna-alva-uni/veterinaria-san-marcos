package cl.VeterinariaSanMarcos.usuarios.service;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.usuarios.entity.Rol;

import java.util.Locale;
import java.util.Map;

/**
 * Reglas de negocio de las cuentas, heredadas de las entregas anteriores del frontend
 * y ahora aplicadas también en el backend (el frontend se puede saltar; el backend no).
 */
public final class ReglasUsuario {

    /** Dominio de correo obligatorio según el rol. */
    public static final Map<Rol, String> DOMINIO_POR_ROL = Map.of(
            Rol.ADMINISTRADOR, "duocuc.cl",
            Rol.RECEPCIONISTA, "gmail.com",
            Rol.VETERINARIO, "duocuc.cl",
            Rol.DUENO, "profesor.duoc.cl");

    private ReglasUsuario() {
    }

    public static String normalizarCorreo(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static void validarDominio(String email, Rol rol) {
        String dominio = DOMINIO_POR_ROL.get(rol);
        if (!normalizarCorreo(email).endsWith("@" + dominio)) {
            throw ApiException.solicitudInvalida("El correo para el rol " + rol.name().toLowerCase(Locale.ROOT)
                    + " debe terminar en @" + dominio + ".");
        }
    }

    /**
     * Normaliza el RUN a "12345678-K" y verifica el dígito verificador (módulo 11).
     */
    public static String normalizarRun(String run) {
        String limpio = run == null ? "" : run.replace(".", "").replace(" ", "").toUpperCase(Locale.ROOT);
        if (!limpio.matches("^\\d{7,8}-?[\\dK]$")) {
            throw ApiException.solicitudInvalida("El RUN debe tener el formato 12345678-9.");
        }
        String cuerpo = limpio.replace("-", "");
        String numero = cuerpo.substring(0, cuerpo.length() - 1);
        char dv = cuerpo.charAt(cuerpo.length() - 1);
        if (dv != calcularDigitoVerificador(numero)) {
            throw ApiException.solicitudInvalida("El dígito verificador del RUN no es válido.");
        }
        return numero + "-" + dv;
    }

    static char calcularDigitoVerificador(String numero) {
        int suma = 0;
        int multiplicador = 2;
        for (int i = numero.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(numero.charAt(i)) * multiplicador;
            multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
        }
        int resto = 11 - (suma % 11);
        if (resto == 11) return '0';
        if (resto == 10) return 'K';
        return (char) ('0' + resto);
    }

    public static String limpiarTelefono(String telefono) {
        return telefono == null || telefono.isBlank() ? null : telefono.trim();
    }
}
