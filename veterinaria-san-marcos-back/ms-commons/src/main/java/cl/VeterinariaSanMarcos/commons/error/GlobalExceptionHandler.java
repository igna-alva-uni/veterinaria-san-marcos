package cl.VeterinariaSanMarcos.commons.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/** Convierte las excepciones en respuestas JSON con el formato ErrorResponse. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> negocio(ApiException e, HttpServletRequest request) {
        return responder(e.getStatus(), e.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException e, HttpServletRequest request) {
        Map<String, String> errores = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(error -> errores.putIfAbsent(error.getField(), error.getDefaultMessage()));
        String mensaje = errores.values().stream().findFirst().orElse("Los datos enviados no son válidos.");
        var cuerpo = new ErrorResponse(Instant.now(), 400, "Bad Request", mensaje, request.getRequestURI(), errores);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> restriccion(ConstraintViolationException e, HttpServletRequest request) {
        String mensaje = e.getConstraintViolations().stream()
                .map(v -> v.getMessage()).findFirst().orElse("Los datos enviados no son válidos.");
        return responder(HttpStatus.BAD_REQUEST, mensaje, request);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> formato(Exception e, HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, "El formato de los datos enviados no es válido.", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integridad(DataIntegrityViolationException e, HttpServletRequest request) {
        log.warn("Violación de integridad en {}: {}", request.getRequestURI(), e.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT, "La operación entra en conflicto con datos existentes.", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> accesoDenegado(AccessDeniedException e, HttpServletRequest request) {
        return responder(HttpStatus.FORBIDDEN, "Tu rol no tiene permiso para realizar esta acción.", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> noAutenticado(AuthenticationException e, HttpServletRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión para continuar.", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> metodo(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP no permitido para esta ruta.", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> rutaInexistente(NoResourceFoundException e, HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, "La ruta solicitada no existe.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> inesperado(Exception e, HttpServletRequest request) {
        log.error("Error no controlado en {}", request.getRequestURI(), e);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el servidor.", request);
    }

    private ResponseEntity<ErrorResponse> responder(HttpStatus status, String mensaje, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(status.value(), status.getReasonPhrase(), mensaje, request.getRequestURI()));
    }
}
