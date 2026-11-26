package cl.VeterinariaSanMarcos.citas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Tabla citas.catalogo_servicios. */
@Entity
@Table(name = "catalogo_servicios")
@Getter
@Setter
@NoArgsConstructor
public class ServicioCatalogo {

    @Id
    @Column(name = "codigo_servicio", length = 10)
    private String codigo;

    @Column(name = "nombre_servicio", nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(name = "especie_permitida", nullable = false, length = 50)
    private String especiePermitida = "TODAS";

    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal precio;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    @Column(nullable = false)
    private boolean activo = true;

    /** "Perro / Gato" admite ambas; "TODAS" admite cualquier especie. */
    public boolean admiteEspecie(String especie) {
        if (especie == null || "TODAS".equalsIgnoreCase(especiePermitida)) {
            return true;
        }
        return especiePermitida.toLowerCase().contains(especie.toLowerCase());
    }
}
