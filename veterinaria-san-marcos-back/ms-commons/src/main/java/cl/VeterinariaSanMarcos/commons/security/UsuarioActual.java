package cl.VeterinariaSanMarcos.commons.security;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Acceso al usuario del token desde los servicios de negocio. */
public final class UsuarioActual {

    private UsuarioActual() {
    }

    public static UsuarioAutenticado obtener() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion != null && autenticacion.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return usuario;
        }
        throw ApiException.noAutorizado("Debes iniciar sesión para continuar.");
    }

    /** Devuelve null cuando la petición es anónima (endpoints públicos). */
    public static UsuarioAutenticado obtenerOpcional() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion != null && autenticacion.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return usuario;
        }
        return null;
    }
}
