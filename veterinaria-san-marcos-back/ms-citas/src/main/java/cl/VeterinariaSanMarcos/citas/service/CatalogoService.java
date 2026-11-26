package cl.VeterinariaSanMarcos.citas.service;

import cl.VeterinariaSanMarcos.citas.dto.ProductoRequest;
import cl.VeterinariaSanMarcos.citas.dto.ProductoResponse;
import cl.VeterinariaSanMarcos.citas.dto.ServicioRequest;
import cl.VeterinariaSanMarcos.citas.dto.ServicioResponse;
import cl.VeterinariaSanMarcos.citas.entity.Producto;
import cl.VeterinariaSanMarcos.citas.entity.ServicioCatalogo;
import cl.VeterinariaSanMarcos.citas.entity.TipoItem;
import cl.VeterinariaSanMarcos.citas.repository.CitaRepository;
import cl.VeterinariaSanMarcos.citas.repository.PedidoDetalleRepository;
import cl.VeterinariaSanMarcos.citas.repository.ProductoRepository;
import cl.VeterinariaSanMarcos.citas.repository.ServicioRepository;
import cl.VeterinariaSanMarcos.commons.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

/** Catálogo de la tienda: servicios veterinarios y productos con stock. */
@Service
public class CatalogoService {

    private final ServicioRepository servicios;
    private final ProductoRepository productos;
    private final CitaRepository citas;
    private final PedidoDetalleRepository detalles;

    public CatalogoService(ServicioRepository servicios, ProductoRepository productos,
                           CitaRepository citas, PedidoDetalleRepository detalles) {
        this.servicios = servicios;
        this.productos = productos;
        this.citas = citas;
        this.detalles = detalles;
    }

    // ---------- Servicios ----------

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarServicios(boolean incluirInactivos) {
        var lista = incluirInactivos ? servicios.findAllByOrderByCodigoAsc() : servicios.findByActivoTrueOrderByCodigoAsc();
        return lista.stream().map(ServicioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ServicioResponse obtenerServicio(String codigo) {
        return ServicioResponse.desde(buscarServicio(codigo));
    }

    @Transactional
    public ServicioResponse crearServicio(ServicioRequest solicitud) {
        String codigo = normalizarCodigo(solicitud.codigo());
        if (servicios.existsById(codigo)) {
            throw ApiException.conflicto("Ya existe un servicio con el código " + codigo + ".");
        }
        ServicioCatalogo servicio = new ServicioCatalogo();
        servicio.setCodigo(codigo);
        aplicar(servicio, solicitud);
        return ServicioResponse.desde(servicios.save(servicio));
    }

    @Transactional
    public ServicioResponse actualizarServicio(String codigo, ServicioRequest solicitud) {
        ServicioCatalogo servicio = buscarServicio(codigo);
        aplicar(servicio, solicitud);
        return ServicioResponse.desde(servicio);
    }

    /**
     * Si el servicio ya se usó en citas o pedidos se desactiva (eliminación lógica) para no
     * romper el historial; si nunca se usó, se elimina de la base.
     * @return true si se eliminó físicamente, false si solo se desactivó
     */
    @Transactional
    public boolean eliminarServicio(String codigo) {
        ServicioCatalogo servicio = buscarServicio(codigo);
        if (citas.existsByServicioCodigo(servicio.getCodigo())
                || detalles.existsByTipoItemAndCodigoItem(TipoItem.SERVICIO, servicio.getCodigo())) {
            servicio.setActivo(false);
            return false;
        }
        servicios.delete(servicio);
        return true;
    }

    // ---------- Productos ----------

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductos(boolean incluirInactivos) {
        var lista = incluirInactivos ? productos.findAllByOrderByCodigoAsc() : productos.findByActivoTrueOrderByCodigoAsc();
        return lista.stream().map(ProductoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProducto(String codigo) {
        return ProductoResponse.desde(buscarProducto(codigo));
    }

    @Transactional
    public ProductoResponse crearProducto(ProductoRequest solicitud) {
        String codigo = normalizarCodigo(solicitud.codigo());
        if (productos.existsById(codigo)) {
            throw ApiException.conflicto("Ya existe un producto con el código " + codigo + ".");
        }
        Producto producto = new Producto();
        producto.setCodigo(codigo);
        aplicar(producto, solicitud);
        return ProductoResponse.desde(productos.save(producto));
    }

    @Transactional
    public ProductoResponse actualizarProducto(String codigo, ProductoRequest solicitud) {
        Producto producto = buscarProducto(codigo);
        aplicar(producto, solicitud);
        return ProductoResponse.desde(producto);
    }

    @Transactional
    public ProductoResponse actualizarStock(String codigo, int stock) {
        Producto producto = buscarProducto(codigo);
        producto.setStock(stock);
        return ProductoResponse.desde(producto);
    }

    /** Igual que en servicios: si el producto aparece en pedidos solo se desactiva. */
    @Transactional
    public boolean eliminarProducto(String codigo) {
        Producto producto = buscarProducto(codigo);
        if (detalles.existsByTipoItemAndCodigoItem(TipoItem.PRODUCTO, producto.getCodigo())) {
            producto.setActivo(false);
            return false;
        }
        productos.delete(producto);
        return true;
    }

    private void aplicar(ServicioCatalogo servicio, ServicioRequest s) {
        servicio.setNombre(s.nombre().trim());
        servicio.setCategoria(s.categoria().trim());
        servicio.setEspeciePermitida(s.especie() == null || s.especie().isBlank() ? "TODAS" : s.especie().trim());
        servicio.setDuracionMinutos(s.duracionMinutos());
        servicio.setPrecio(BigDecimal.valueOf(s.precio()));
        servicio.setComentarios(s.observaciones() == null || s.observaciones().isBlank() ? null : s.observaciones().trim());
        if (s.activo() != null) {
            servicio.setActivo(s.activo());
        }
    }

    private void aplicar(Producto producto, ProductoRequest p) {
        producto.setNombre(p.nombre().trim());
        producto.setCategoria(p.categoria().trim());
        producto.setPrincipioActivo(p.principioActivo() == null ? null : p.principioActivo().trim());
        producto.setPresentacion(p.presentacion() == null ? null : p.presentacion().trim());
        producto.setEspeciePermitida(p.especie() == null || p.especie().isBlank() ? "TODAS" : p.especie().trim());
        producto.setStock(p.stock());
        producto.setPrecio(BigDecimal.valueOf(p.precio()));
        if (p.activo() != null) {
            producto.setActivo(p.activo());
        }
    }

    ServicioCatalogo buscarServicio(String codigo) {
        return servicios.findById(normalizarCodigo(codigo))
                .orElseThrow(() -> ApiException.noEncontrado("No se encontró el servicio " + codigo + "."));
    }

    private Producto buscarProducto(String codigo) {
        return productos.findById(normalizarCodigo(codigo))
                .orElseThrow(() -> ApiException.noEncontrado("No se encontró el producto " + codigo + "."));
    }

    static String normalizarCodigo(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
    }
}
