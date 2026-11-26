package cl.VeterinariaSanMarcos.citas.controller;

import cl.VeterinariaSanMarcos.citas.dto.ServicioRequest;
import cl.VeterinariaSanMarcos.citas.dto.ServicioResponse;
import cl.VeterinariaSanMarcos.citas.service.CatalogoService;
import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
import cl.VeterinariaSanMarcos.commons.security.UsuarioAutenticado;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/servicios")
@Tag(name = "Servicios", description = "Catálogo de servicios veterinarios. Lectura pública; cambios solo ADMINISTRADOR")
public class ServicioController {

    private final CatalogoService catalogo;

    public ServicioController(CatalogoService catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping
    @SecurityRequirements
    @Operation(summary = "Listar servicios", description = "Por defecto solo activos. incluirInactivos=true solo tiene efecto para administración.")
    public List<ServicioResponse> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        UsuarioAutenticado actual = UsuarioActual.obtenerOpcional();
        boolean admin = actual != null && actual.tieneRol(UsuarioAutenticado.ADMINISTRADOR);
        return catalogo.listarServicios(incluirInactivos && admin);
    }

    @GetMapping("/{codigo}")
    @SecurityRequirements
    @Operation(summary = "Obtener servicio")
    public ServicioResponse obtener(@PathVariable String codigo) {
        return catalogo.obtenerServicio(codigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear servicio", description = "409 si el código ya existe.")
    public ServicioResponse crear(@Valid @RequestBody ServicioRequest solicitud) {
        return catalogo.crearServicio(solicitud);
    }

    @PutMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar servicio", description = "El código de la URL manda; el del cuerpo se ignora.")
    public ServicioResponse actualizar(@PathVariable String codigo, @Valid @RequestBody ServicioRequest solicitud) {
        return catalogo.actualizarServicio(codigo, solicitud);
    }

    @DeleteMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar servicio", description = "204 si se eliminó; 200 si estaba en uso y solo se desactivó.")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable String codigo) {
        if (catalogo.eliminarServicio(codigo)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("mensaje", "El servicio tiene citas o pedidos asociados: se desactivó en lugar de eliminarse."));
    }
}
