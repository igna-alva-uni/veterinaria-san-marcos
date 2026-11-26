package cl.VeterinariaSanMarcos.commons.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el encabezado "Authorization: Bearer <token>", valida el JWT y deja al usuario
 * autenticado en el SecurityContext con la autoridad ROLE_<rol>.
 * Si el token es inválido o expiró no autentica: Spring Security responde 401.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String ATRIBUTO_ERROR = "jwt_error";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (encabezado != null && encabezado.startsWith("Bearer ")) {
            String token = encabezado.substring(7).trim();
            try {
                UsuarioAutenticado usuario = jwtService.validar(token);
                var autenticacion = new UsernamePasswordAuthenticationToken(
                        usuario, null, List.of(new SimpleGrantedAuthority("ROLE_" + usuario.rol())));
                autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            } catch (ExpiredJwtException e) {
                request.setAttribute(ATRIBUTO_ERROR, "La sesión expiró. Inicia sesión nuevamente.");
            } catch (JwtException | IllegalArgumentException e) {
                request.setAttribute(ATRIBUTO_ERROR, "El token de sesión no es válido.");
            }
        }
        chain.doFilter(request, response);
    }
}
