package cl.VeterinariaSanMarcos.usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos que cada usuario puede cambiar de su propia cuenta. */
public record PerfilRequest(
        @NotBlank(message = "Ingresa tu nombre") @Size(max = 50) String nombre,
        @NotBlank(message = "Ingresa tu apellido") @Size(max = 50) String apellido,
        @Pattern(regexp = "^$|^\\+?[0-9 ]{8,15}$", message = "El teléfono no es válido") String telefono) {
}
