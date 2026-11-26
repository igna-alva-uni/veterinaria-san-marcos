package cl.VeterinariaSanMarcos.citas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ServicioRequest(
        @NotBlank(message = "Ingresa el código") @Pattern(regexp = "^SV\\d{3,8}$", message = "El código de servicio debe tener el formato SV001") String codigo,
        @NotBlank(message = "Ingresa el nombre") @Size(max = 100) String nombre,
        @NotBlank(message = "Ingresa la categoría") @Size(max = 50) String categoria,
        @Size(max = 50) String especie,
        @NotNull(message = "Ingresa la duración") @Positive(message = "La duración debe ser mayor a 0") @Max(1440) Integer duracionMinutos,
        @NotNull(message = "Ingresa el precio") @PositiveOrZero(message = "El precio no puede ser negativo") Long precio,
        String observaciones,
        Boolean activo) {
}
