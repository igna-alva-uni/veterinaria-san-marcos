package cl.VeterinariaSanMarcos.citas.controller;

import cl.VeterinariaSanMarcos.citas.dto.EstadoPedidoRequest;
import cl.VeterinariaSanMarcos.citas.dto.PedidoRequest;
import cl.VeterinariaSanMarcos.citas.dto.PedidoResponse;
import cl.VeterinariaSanMarcos.citas.service.PedidoService;
import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
@Tag(name = "Pedidos", description = "Compras de la tienda (carrito). El precio y el stock los controla el backend")
public class PedidoController {

    private final PedidoService servicio;

    public PedidoController(PedidoService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Confirmar pedido", description = "Descuenta stock en una transacción. 409 si no hay stock suficiente.")
    public PedidoResponse crear(@Valid @RequestBody PedidoRequest solicitud) {
        return servicio.crear(solicitud, UsuarioActual.obtener());
    }

    @GetMapping("/mios")
    @Operation(summary = "Mis pedidos")
    public List<PedidoResponse> listarPropios() {
        return servicio.listarPropios(UsuarioActual.obtener());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
    @Operation(summary = "Listar todos los pedidos", description = "Solo administración y recepción.")
    public List<PedidoResponse> listarTodos() {
        return servicio.listarTodos();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener pedido", description = "El cliente solo puede ver sus pedidos (403 en otro caso).")
    public PedidoResponse obtener(@PathVariable Long id) {
        return servicio.obtener(id, UsuarioActual.obtener());
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado del pedido", description = "Personal: CONFIRMADO, ENTREGADO o CANCELADO. Cliente: solo CANCELADO si está PENDIENTE. Cancelar devuelve el stock.")
    public PedidoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoPedidoRequest solicitud) {
        return servicio.cambiarEstado(id, solicitud.estado(), UsuarioActual.obtener());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar pedido cancelado")
    public void eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
    }
}
