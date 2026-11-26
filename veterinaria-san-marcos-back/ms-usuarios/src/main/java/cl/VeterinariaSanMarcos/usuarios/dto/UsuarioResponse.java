package cl.VeterinariaSanMarcos.usuarios.dto;

import cl.VeterinariaSanMarcos.usuarios.entity.Usuario;

import java.time.Instant;

/** Representación pública del usuario: nunca incluye la contraseña. */
public record UsuarioResponse(
        Long id,
        String run,
        String nombre,
        String apellido,
        String email,
        String rol,
        String telefono,
        boolean activo,
        Instant fechaCreacion) {

    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getRun(), u.getNombre(), u.getApellido(), u.getEmail(),
                u.getRol().name(), u.getTelefono(), u.isActivo(), u.getFechaCreacion());
    }
}
