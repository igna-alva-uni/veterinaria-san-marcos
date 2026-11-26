package cl.VeterinariaSanMarcos.commons.security;

import java.util.Arrays;

/**
 * Datos del usuario obtenidos desde los claims del JWT.
 * Se guarda como "principal" en el SecurityContext de cada microservicio.
 */
public record UsuarioAutenticado(Long id, String email, String nombre, String rol) {

    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String RECEPCIONISTA = "RECEPCIONISTA";
    public static final String VETERINARIO = "VETERINARIO";
    public static final String DUENO = "DUENO";

    public boolean tieneRol(String... roles) {
        return Arrays.asList(roles).contains(rol);
    }

    /** Personal de la clínica: puede ver información de todos los dueños. */
    public boolean esPersonal() {
        return tieneRol(ADMINISTRADOR, RECEPCIONISTA, VETERINARIO);
    }

    public boolean esDueno() {
        return DUENO.equals(rol);
    }
}
