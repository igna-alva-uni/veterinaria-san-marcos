package cl.VeterinariaSanMarcos.citas.controller;

import cl.VeterinariaSanMarcos.citas.dto.ProductoRequest;
import cl.VeterinariaSanMarcos.citas.dto.ProductoResponse;
import cl.VeterinariaSanMarcos.citas.dto.StockRequest;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos", description = "Medicamentos y artículos de la tienda. Lectura pública; cambios solo ADMINISTRADOR")
public class ProductoController {

    private final CatalogoService catalogo;

    public ProductoController(CatalogoService catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping
    @SecurityRequirements
    @Operation(summary = "Listar productos", description = "Por defecto solo activos. incluirInactivos=true solo tiene efecto para administración.")
    public List<ProductoResponse> listar(@RequestParam(defaultValue = "false") boolean incluirInactivos) {
        UsuarioAutenticado actual = UsuarioActual.obtenerOpcional();
        boolean admin = actual != null && actual.tieneRol(UsuarioAutenticado.ADMINISTRADOR);
        return catalogo.listarProductos(incluirInactivos && admin);
    }

    @GetMapping("/{codigo}")
    @SecurityRequirements
    @Operation(summary = "Obtener producto")
    public ProductoResponse obtener(@PathVariable String codigo) {
        return catalogo.obtenerProducto(codigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear producto", description = "409 si el código ya existe.")
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest solicitud) {
        return catalogo.crearProducto(solicitud);
    }

    @PutMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Actualizar producto")
    public ProductoResponse actualizar(@PathVariable String codigo, @Valid @RequestBody ProductoRequest solicitud) {
        return catalogo.actualizarProducto(codigo, solicitud);
    }

    @PatchMapping("/{codigo}/stock")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Ajustar stock")
    public ProductoResponse actualizarStock(@PathVariable String codigo, @Valid @RequestBody StockRequest solicitud) {
        return catalogo.actualizarStock(codigo, solicitud.stock());
    }

    @DeleteMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar producto", description = "204 si se eliminó; 200 si tenía ventas y solo se desactivó.")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable String codigo) {
        if (catalogo.eliminarProducto(codigo)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("mensaje", "El producto tiene pedidos asociados: se desactivó en lugar de eliminarse."));
    }
}
