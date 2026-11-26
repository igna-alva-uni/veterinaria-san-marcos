package cl.VeterinariaSanMarcos.usuarios.dto;

import java.time.Instant;

/** Respuesta del login: el frontend guarda token y expiraEn para mantener la sesión al recargar. */
public record LoginResponse(String token, String tipo, Instant expiraEn, UsuarioResponse usuario) {
}
