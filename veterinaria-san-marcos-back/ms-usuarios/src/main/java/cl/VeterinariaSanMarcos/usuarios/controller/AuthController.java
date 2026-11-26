package cl.VeterinariaSanMarcos.usuarios.controller;

import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
import cl.VeterinariaSanMarcos.usuarios.dto.LoginRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.LoginResponse;
import cl.VeterinariaSanMarcos.usuarios.dto.RegistroRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioResponse;
import cl.VeterinariaSanMarcos.usuarios.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Inicio de sesión con JWT, registro de dueños y sesión actual")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(summary = "Iniciar sesión", description = "Devuelve un JWT y los datos del usuario. 401 si las credenciales no son válidas.")
    public LoginResponse login(@Valid @RequestBody LoginRequest solicitud) {
        return authService.login(solicitud);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirements
    @Operation(summary = "Registrar dueño de mascota", description = "Crea una cuenta con rol DUENO. 409 si el correo o el RUN ya existen.")
    public UsuarioResponse registrar(@Valid @RequestBody RegistroRequest solicitud) {
        return authService.registrar(solicitud);
    }

    @GetMapping("/me")
    @Operation(summary = "Sesión actual", description = "Valida el token y devuelve el usuario. El frontend lo usa al recargar la página.")
    public UsuarioResponse sesionActual() {
        return authService.sesionActual(UsuarioActual.obtener().id());
    }
}
