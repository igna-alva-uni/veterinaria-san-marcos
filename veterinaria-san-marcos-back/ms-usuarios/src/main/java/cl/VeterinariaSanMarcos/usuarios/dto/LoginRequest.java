package cl.VeterinariaSanMarcos.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Ingresa tu correo electrónico") @Email(message = "El correo no es válido") String email,
        @NotBlank(message = "Ingresa tu contraseña") String password) {
}
