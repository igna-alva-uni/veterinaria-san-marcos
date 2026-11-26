package cl.VeterinariaSanMarcos.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Registro público: siempre crea una cuenta con rol DUENO. */
public record RegistroRequest(
        @NotBlank(message = "Ingresa tu RUN") String run,
        @NotBlank(message = "Ingresa tu nombre") @Size(max = 50, message = "El nombre admite hasta 50 caracteres") String nombre,
        @NotBlank(message = "Ingresa tu apellido") @Size(max = 50, message = "El apellido admite hasta 50 caracteres") String apellido,
        @NotBlank(message = "Ingresa tu correo electrónico") @Email(message = "El correo no es válido") @Size(max = 100) String email,
        @NotBlank(message = "Ingresa una contraseña") @Size(min = 8, max = 72, message = "La contraseña debe tener al menos 8 caracteres") String password,
        @Pattern(regexp = "^$|^\\+?[0-9 ]{8,15}$", message = "El teléfono no es válido") String telefono) {
}
