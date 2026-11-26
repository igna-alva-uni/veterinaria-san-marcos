package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductoRequest(
        @NotBlank(message = "Ingresa el código") @Pattern(regexp = "^ME\\d{3,8}$", message = "El código de producto debe tener el formato ME001") String codigo,
        @NotBlank(message = "Ingresa el nombre") @Size(max = 100) String nombre,
        @NotBlank(message = "Ingresa la categoría") @Size(max = 50) String categoria,
        @Size(max = 100) String principioActivo,
        @Size(max = 100) String presentacion,
        @Size(max = 50) String especie,
        @NotNull(message = "Ingresa el stock") @PositiveOrZero(message = "El stock no puede ser negativo") Integer stock,
        @NotNull(message = "Ingresa el precio") @PositiveOrZero(message = "El precio no puede ser negativo") Long precio,
        Boolean activo) {
}
