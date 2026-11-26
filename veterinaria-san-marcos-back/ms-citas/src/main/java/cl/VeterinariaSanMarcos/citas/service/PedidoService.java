package cl.VeterinariaSanMarcos.citas.service;

import cl.VeterinariaSanMarcos.citas.dto.ItemPedidoRequest;
import cl.VeterinariaSanMarcos.citas.dto.PedidoRequest;
import cl.VeterinariaSanMarcos.citas.dto.PedidoResponse;
import cl.VeterinariaSanMarcos.citas.entity.EstadoPedido;
import cl.VeterinariaSanMarcos.citas.entity.Pedido;
import cl.VeterinariaSanMarcos.citas.entity.PedidoDetalle;
import cl.VeterinariaSanMarcos.citas.entity.Producto;
import cl.VeterinariaSanMarcos.citas.entity.ServicioCatalogo;
import cl.VeterinariaSanMarcos.citas.entity.TipoItem;
import cl.VeterinariaSanMarcos.citas.repository.PedidoRepository;
import cl.VeterinariaSanMarcos.citas.repository.ProductoRepository;
import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.commons.security.UsuarioAutenticado;
import cl.VeterinariaSanMarcos.commons.util.Fechas;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/** Pedidos de la tienda generados desde el carrito del frontend. */
@Service
public class PedidoService {

    private static final DateTimeFormatter FORMATO_NUMERO = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    /** Transiciones válidas del estado de un pedido. */
    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES = Map.of(
            EstadoPedido.PENDIENTE, Set.of(EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO),
            EstadoPedido.CONFIRMADO, Set.of(EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO),
            EstadoPedido.ENTREGADO, Set.of(),
            EstadoPedido.CANCELADO, Set.of());

    private final PedidoRepository pedidos;
    private final ProductoRepository productos;
    private final CatalogoService catalogo;

    public PedidoService(PedidoRepository pedidos, ProductoRepository productos, CatalogoService catalogo) {
        this.pedidos = pedidos;
        this.productos = productos;
        this.catalogo = catalogo;
    }

    /**
     * Crea el pedido en una sola transacción:
     * 1) agrupa ítems repetidos, 2) toma precio y nombre desde la base (nunca del cliente),
     * 3) bloquea cada producto y descuenta stock, 4) calcula subtotales y total.
     * Si cualquier ítem falla, no se guarda nada y el stock no cambia (rollback).
     */
    @Transactional
    public PedidoResponse crear(PedidoRequest solicitud, UsuarioAutenticado actual) {
        Map<String, ItemPedidoRequest> agrupados = new LinkedHashMap<>();
        for (ItemPedidoRequest item : solicitud.items()) {
            String clave = item.tipo() + ":" + CatalogoService.normalizarCodigo(item.codigo());
            agrupados.merge(clave, item, (a, b) -> new ItemPedidoRequest(a.tipo(), a.codigo(), a.cantidad() + b.cantidad()));
        }

        var cliente = solicitud.cliente();
        Pedido pedido = new Pedido();
        pedido.setNumero(generarNumero());
        pedido.setIdUsuario(actual.id());
        pedido.setNombreCliente(cliente.nombre().trim());
        pedido.setCorreoCliente(cliente.correo().trim().toLowerCase());
        pedido.setTelefonoCliente(vacioANull(cliente.telefono()));
        pedido.setDireccion(vacioANull(cliente.direccion()));
        pedido.setComuna(vacioANull(cliente.comuna()));
        pedido.setObservaciones(vacioANull(cliente.observaciones()));

        BigDecimal subtotalProductos = BigDecimal.ZERO;
        BigDecimal subtotalServicios = BigDecimal.ZERO;

        for (ItemPedidoRequest item : agrupados.values()) {
            PedidoDetalle detalle = new PedidoDetalle();
            detalle.setTipoItem(item.tipo());
            if (item.tipo() == TipoItem.PRODUCTO) {
                Producto producto = productos.bloquearPorCodigo(CatalogoService.normalizarCodigo(item.codigo()))
                        .filter(Producto::isActivo)
                        .orElseThrow(() -> ApiException.solicitudInvalida("El producto " + item.codigo() + " ya no está disponible."));
                if (item.cantidad() > producto.getStock()) {
                    throw ApiException.conflicto("Stock insuficiente para " + producto.getNombre()
                            + ". Disponible: " + producto.getStock() + ".");
                }
                producto.setStock(producto.getStock() - item.cantidad());
                completar(detalle, producto.getCodigo(), producto.getNombre(), producto.getPrecio(), item.cantidad());
                subtotalProductos = subtotalProductos.add(detalle.getSubtotal());
            } else {
                ServicioCatalogo servicio = catalogo.buscarServicio(item.codigo());
                if (!servicio.isActivo()) {
                    throw ApiException.solicitudInvalida("El servicio " + servicio.getNombre() + " ya no está disponible.");
                }
                // Un servicio se agenda por atención: en el carrito siempre cuenta como 1.
                completar(detalle, servicio.getCodigo(), servicio.getNombre(), servicio.getPrecio(), 1);
                subtotalServicios = subtotalServicios.add(detalle.getSubtotal());
            }
            pedido.agregarDetalle(detalle);
        }

        pedido.setSubtotalProductos(subtotalProductos);
        pedido.setSubtotalServicios(subtotalServicios);
        pedido.setTotal(subtotalProductos.add(subtotalServicios));
        pedido.setEstado(EstadoPedido.PENDIENTE);
        return PedidoResponse.desde(pedidos.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPropios(UsuarioAutenticado actual) {
        return pedidos.findByIdUsuarioOrderByFechaCreacionDesc(actual.id()).stream().map(PedidoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidos.findAllByOrderByFechaCreacionDesc().stream().map(PedidoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtener(Long id, UsuarioAutenticado actual) {
        return PedidoResponse.desde(buscarVisible(id, actual));
    }

    /**
     * Personal: confirma, entrega o cancela. Cliente: solo puede cancelar su pedido mientras esté pendiente.
     * Al cancelar se devuelve el stock de los productos.
     */
    @Transactional
    public PedidoResponse cambiarEstado(Long id, EstadoPedido nuevo, UsuarioAutenticado actual) {
        Pedido pedido = buscarVisible(id, actual);
        boolean personal = actual.tieneRol(UsuarioAutenticado.ADMINISTRADOR, UsuarioAutenticado.RECEPCIONISTA);
        if (!personal && !(nuevo == EstadoPedido.CANCELADO && pedido.getEstado() == EstadoPedido.PENDIENTE)) {
            throw ApiException.prohibido("Solo puedes cancelar tus pedidos mientras estén pendientes.");
        }
        if (!TRANSICIONES.get(pedido.getEstado()).contains(nuevo)) {
            throw ApiException.conflicto("No se puede pasar un pedido de " + pedido.getEstado() + " a " + nuevo + ".");
        }
        if (nuevo == EstadoPedido.CANCELADO) {
            devolverStock(pedido);
        }
        pedido.setEstado(nuevo);
        return PedidoResponse.desde(pedido);
    }

    /** Solo se eliminan pedidos ya cancelados (el stock ya fue devuelto). */
    @Transactional
    public void eliminar(Long id) {
        Pedido pedido = pedidos.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró el pedido."));
        if (pedido.getEstado() != EstadoPedido.CANCELADO) {
            throw ApiException.conflicto("Solo se pueden eliminar pedidos cancelados.");
        }
        pedidos.delete(pedido);
    }

    private void devolverStock(Pedido pedido) {
        for (PedidoDetalle detalle : pedido.getDetalles()) {
            if (detalle.getTipoItem() == TipoItem.PRODUCTO) {
                productos.bloquearPorCodigo(detalle.getCodigoItem())
                        .ifPresent(p -> p.setStock(p.getStock() + detalle.getCantidad()));
            }
        }
    }

    private static void completar(PedidoDetalle detalle, String codigo, String nombre, BigDecimal precio, int cantidad) {
        detalle.setCodigoItem(codigo);
        detalle.setNombreItem(nombre);
        detalle.setPrecioUnitario(precio);
        detalle.setCantidad(cantidad);
        detalle.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidad)));
    }

    private String generarNumero() {
        String numero;
        do {
            numero = "VSM-" + LocalDateTime.now(Fechas.ZONA_CLINICA).format(FORMATO_NUMERO)
                    + String.format("%02d", ThreadLocalRandom.current().nextInt(100));
        } while (pedidos.existsByNumero(numero));
        return numero;
    }

    private Pedido buscarVisible(Long id, UsuarioAutenticado actual) {
        Pedido pedido = pedidos.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró el pedido."));
        boolean personal = actual.tieneRol(UsuarioAutenticado.ADMINISTRADOR, UsuarioAutenticado.RECEPCIONISTA);
        if (!personal && !Objects.equals(pedido.getIdUsuario(), actual.id())) {
            throw ApiException.prohibido("No tienes permiso para ver este pedido.");
        }
        return pedido;
    }

    private static String vacioANull(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
