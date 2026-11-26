package cl.VeterinariaSanMarcos.citas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Tabla citas.pedido_detalle. Guarda nombre y precio al momento de la compra para que
 * el pedido no cambie si después se edita el catálogo.
 */
@Entity
@Table(name = "pedido_detalle")
@Getter
@Setter
@NoArgsConstructor
public class PedidoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_item", nullable = false, length = 10)
    private TipoItem tipoItem;

    @Column(name = "codigo_item", nullable = false, length = 10)
    private String codigoItem;

    @Column(name = "nombre_item", nullable = false, length = 100)
    private String nombreItem;

    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 0)
    private BigDecimal precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal subtotal;
}
