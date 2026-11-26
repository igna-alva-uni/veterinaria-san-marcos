package cl.VeterinariaSanMarcos.commons.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Crea y valida los JWT. Todos los microservicios comparten la misma clave (JWT_SECRET),
 * por eso cualquiera puede verificar un token emitido por ms-usuarios sin consultarlo.
 */
@Service
public class JwtService {

    static final String EMISOR = "veterinaria-san-marcos";

    private final SecretKey clave;
    private final long minutosExpiracion;

    public JwtService(@Value("${jwt.secret}") String secreto,
                      @Value("${jwt.expiration-minutes:60}") long minutosExpiracion) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres (HS256).");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.minutosExpiracion = minutosExpiracion;
    }

    public TokenGenerado generar(Long idUsuario, String email, String nombre, String rol) {
        Instant ahora = Instant.now();
        Instant expiracion = ahora.plus(minutosExpiracion, ChronoUnit.MINUTES);
        String token = Jwts.builder()
                .subject(String.valueOf(idUsuario))
                .issuer(EMISOR)
                .claim("email", email)
                .claim("nombre", nombre)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expiracion))
                .signWith(clave)
                .compact();
        return new TokenGenerado(token, expiracion);
    }

    /**
     * Verifica firma, emisor y expiración. Lanza ExpiredJwtException si el token venció
     * o JwtException si fue alterado o no corresponde a este sistema.
     */
    public UsuarioAutenticado validar(String token) throws JwtException {
        Claims claims = Jwts.parser()
                .verifyWith(clave)
                .requireIssuer(EMISOR)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new UsuarioAutenticado(
                Long.valueOf(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("nombre", String.class),
                claims.get("rol", String.class));
    }

    public record TokenGenerado(String token, Instant expiraEn) {
    }
}
