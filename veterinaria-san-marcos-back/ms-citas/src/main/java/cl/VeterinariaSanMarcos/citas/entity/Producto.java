package cl.VeterinariaSanMarcos.citas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Tabla citas.productos: medicamentos y artículos que se venden en la tienda. */
@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @Column(name = "codigo_producto", length = 10)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(name = "principio_activo", length = 100)
    private String principioActivo;

    @Column(length = 100)
    private String presentacion;

    @Column(name = "especie_permitida", nullable = false, length = 50)
    private String especiePermitida = "TODAS";

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal precio;

    @Column(nullable = false)
    private boolean activo = true;
}
