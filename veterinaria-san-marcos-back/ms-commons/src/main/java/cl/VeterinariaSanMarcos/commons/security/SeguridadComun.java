package cl.VeterinariaSanMarcos.commons.security;

import cl.VeterinariaSanMarcos.commons.error.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Configuración de seguridad que comparten los microservicios de negocio:
 * API sin estado (no hay sesión HTTP), sin CSRF (se usa Bearer token, no cookies),
 * filtro JWT y respuestas 401/403 en JSON. Cada microservicio define sus propias reglas de rutas.
 */
@Component
public class SeguridadComun {

    /** Rutas abiertas en todos los servicios: documentación OpenAPI y salud. */
    public static final String[] RUTAS_PUBLICAS = {
            "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/actuator/health/**", "/error"
    };

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    public SeguridadComun(JwtService jwtService, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
    }

    public HttpSecurity aplicar(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((request, response, ex) -> {
                            Object detalle = request.getAttribute(JwtAuthenticationFilter.ATRIBUTO_ERROR);
                            String mensaje = detalle != null ? detalle.toString() : "Debes iniciar sesión para continuar.";
                            escribir(request, response, HttpStatus.UNAUTHORIZED, mensaje);
                        })
                        .accessDeniedHandler((request, response, ex) ->
                                escribir(request, response, HttpStatus.FORBIDDEN,
                                        "Tu rol no tiene permiso para realizar esta acción.")))
                .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class);
    }

    private void escribir(HttpServletRequest request, HttpServletResponse response,
                          HttpStatus status, String mensaje) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        var cuerpo = ErrorResponse.of(status.value(), status.getReasonPhrase(), mensaje, request.getRequestURI());
        objectMapper.writeValue(response.getOutputStream(), cuerpo);
    }
}
