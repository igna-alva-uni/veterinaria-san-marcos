package cl.VeterinariaSanMarcos.usuarios.dto;

import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Edición desde administración. La contraseña no se modifica por esta vía. */
public record UsuarioUpdateRequest(
        @NotBlank(message = "Ingresa el nombre") @Size(max = 50) String nombre,
        @NotBlank(message = "Ingresa el apellido") @Size(max = 50) String apellido,
        @NotBlank(message = "Ingresa el correo") @Email(message = "El correo no es válido") @Size(max = 100) String email,
        @NotNull(message = "Selecciona un rol") Rol rol,
        @Pattern(regexp = "^$|^\\+?[0-9 ]{8,15}$", message = "El teléfono no es válido") String telefono) {
}
