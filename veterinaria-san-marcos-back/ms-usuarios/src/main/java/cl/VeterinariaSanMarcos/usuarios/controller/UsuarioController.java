package cl.VeterinariaSanMarcos.usuarios.controller;

import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
import cl.VeterinariaSanMarcos.usuarios.dto.EstadoRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.PerfilRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioResponse;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioUpdateRequest;
import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import cl.VeterinariaSanMarcos.usuarios.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios", description = "CRUD de cuentas. Crear, editar, activar y eliminar requiere rol ADMINISTRADOR")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','VETERINARIO')")
    @Operation(summary = "Listar usuarios", description = "Personal de la clínica. Filtro opcional por rol.")
    public List<UsuarioResponse> listar(@RequestParam(required = false) Rol rol) {
        return usuarioService.listar(rol);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario", description = "El personal puede ver cualquier cuenta; un dueño solo la suya (403 en otro caso).")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id, UsuarioActual.obtener());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear usuario", description = "Valida RUN, dominio de correo según rol y unicidad de correo/RUN.")
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest solicitud) {
        return usuarioService.crear(solicitud);
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar mi perfil", description = "Cualquier usuario autenticado puede cambiar su nombre, apellido y teléfono.")
    public UsuarioResponse actualizarPerfil(@Valid @RequestBody PerfilRequest solicitud) {
        return usuarioService.actualizarPerfil(UsuarioActual.obtener(), solicitud);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Editar usuario", description = "El administrador no puede cambiar su propio rol.")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest solicitud) {
        return usuarioService.actualizar(id, solicitud, UsuarioActual.obtener());
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Activar o desactivar usuario", description = "Una cuenta desactivada no puede iniciar sesión.")
    public UsuarioResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest solicitud) {
        return usuarioService.cambiarEstado(id, solicitud.activo(), UsuarioActual.obtener());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar cliente", description = "Solo clientes (DUENO) sin mascotas. Consulta ms-pacientes antes de borrar.")
    public void eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id, UsuarioActual.obtener());
    }
}
