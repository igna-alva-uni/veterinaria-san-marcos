package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos de contacto del formulario "Datos del cliente" del carrito. */
public record ClienteDto(
        @NotBlank(message = "Ingresa tu nombre") @Size(max = 100) String nombre,
        @NotBlank(message = "Ingresa tu correo") @Email(message = "El correo no es válido") @Size(max = 100) String correo,
        @Pattern(regexp = "^$|^\\+?[0-9 ]{8,20}$", message = "El teléfono no es válido") String telefono,
        @Size(max = 150) String direccion,
        @Size(max = 60) String comuna,
        @Size(max = 1000) String observaciones) {
}
