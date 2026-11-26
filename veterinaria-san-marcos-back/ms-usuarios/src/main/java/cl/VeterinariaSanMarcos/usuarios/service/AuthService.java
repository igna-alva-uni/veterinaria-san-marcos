package cl.VeterinariaSanMarcos.usuarios.service;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.commons.security.JwtService;
import cl.VeterinariaSanMarcos.usuarios.dto.LoginRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.LoginResponse;
import cl.VeterinariaSanMarcos.usuarios.dto.RegistroRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioResponse;
import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import cl.VeterinariaSanMarcos.usuarios.entity.Usuario;
import cl.VeterinariaSanMarcos.usuarios.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String CREDENCIALES_INVALIDAS = "Credenciales inválidas o usuario desactivado";

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository repositorio, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Verifica el correo y el hash BCrypt de la contraseña. Si coinciden y la cuenta está activa,
     * emite un JWT firmado con el id, correo, nombre y rol del usuario.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest solicitud) {
        Usuario usuario = repositorio.findByEmailIgnoreCase(ReglasUsuario.normalizarCorreo(solicitud.email()))
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(solicitud.password(), u.getPassword()))
                .orElseThrow(() -> ApiException.noAutorizado(CREDENCIALES_INVALIDAS));
        var token = jwtService.generar(usuario.getId(), usuario.getEmail(), usuario.getNombre(), usuario.getRol().name());
        return new LoginResponse(token.token(), "Bearer", token.expiraEn(), UsuarioResponse.desde(usuario));
    }

    /** Registro público de dueños de mascotas. */
    @Transactional
    public UsuarioResponse registrar(RegistroRequest solicitud) {
        String email = ReglasUsuario.normalizarCorreo(solicitud.email());
        String run = ReglasUsuario.normalizarRun(solicitud.run());
        ReglasUsuario.validarDominio(email, Rol.DUENO);
        if (repositorio.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflicto("Correo ya registrado");
        }
        if (repositorio.existsByRun(run)) {
            throw ApiException.conflicto("El RUN ya está registrado");
        }
        Usuario usuario = new Usuario();
        usuario.setRun(run);
        usuario.setNombre(solicitud.nombre().trim());
        usuario.setApellido(solicitud.apellido().trim());
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(solicitud.password()));
        usuario.setRol(Rol.DUENO);
        usuario.setTelefono(ReglasUsuario.limpiarTelefono(solicitud.telefono()));
        usuario.setActivo(true);
        return UsuarioResponse.desde(repositorio.save(usuario));
    }

    /**
     * Usado por el frontend al recargar la página: confirma que el token sigue siendo válido
     * y que la cuenta continúa activa (un token vigente de una cuenta desactivada se rechaza).
     */
    @Transactional(readOnly = true)
    public UsuarioResponse sesionActual(Long idUsuario) {
        return repositorio.findById(idUsuario)
                .filter(Usuario::isActivo)
                .map(UsuarioResponse::desde)
                .orElseThrow(() -> ApiException.noAutorizado("Tu cuenta ya no está disponible. Inicia sesión nuevamente."));
    }
}
