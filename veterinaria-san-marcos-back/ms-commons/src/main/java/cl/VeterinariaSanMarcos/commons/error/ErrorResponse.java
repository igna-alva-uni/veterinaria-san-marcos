package cl.VeterinariaSanMarcos.commons.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/** Formato único de error que reciben el frontend y Swagger desde todos los microservicios. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> errores) {

    public static ErrorResponse of(int status, String error, String mensaje, String ruta) {
        return new ErrorResponse(Instant.now(), status, error, mensaje, ruta, null);
    }
}
