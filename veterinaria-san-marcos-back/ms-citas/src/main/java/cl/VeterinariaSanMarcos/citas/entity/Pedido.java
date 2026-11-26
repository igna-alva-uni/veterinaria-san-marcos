package cl.VeterinariaSanMarcos.citas.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Tabla citas.pedidos: compra generada desde el carrito de la tienda. */
@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "nombre_cliente", nullable = false, length = 100)
    private String nombreCliente;

    @Column(name = "correo_cliente", nullable = false, length = 100)
    private String correoCliente;

    @Column(name = "telefono_cliente", length = 20)
    private String telefonoCliente;

    @Column(length = 150)
    private String direccion;

    @Column(length = 60)
    private String comuna;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "subtotal_productos", nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotalProductos = BigDecimal.ZERO;

    @Column(name = "subtotal_servicios", nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotalServicios = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoDetalle> detalles = new ArrayList<>();

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = Instant.now();
        }
    }

    public void agregarDetalle(PedidoDetalle detalle) {
        detalle.setPedido(this);
        detalles.add(detalle);
    }
}
