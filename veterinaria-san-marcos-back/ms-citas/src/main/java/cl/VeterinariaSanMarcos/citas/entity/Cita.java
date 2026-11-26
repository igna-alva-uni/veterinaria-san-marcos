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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Tabla citas.citas. id_paciente e id_dueno pertenecen a otros microservicios,
 * por eso se guardan como ids y se validan vía API (Feign) al crear la cita.
 */
@Entity
@Table(name = "citas")
@Getter
@Setter
@NoArgsConstructor
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita")
    private Long id;

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;

    /** Precio del servicio al momento de solicitar; no cambia si después se actualiza el catálogo. */
    @Column(name = "precio_acordado", nullable = false, precision = 12, scale = 0)
    private BigDecimal precioAcordado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCita estado = EstadoCita.SOLICITADA;

    @Enumerated(EnumType.STRING)
    @Column(name = "pago_estado", nullable = false, length = 20)
    private EstadoPago pagoEstado = EstadoPago.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "codigo_servicio", nullable = false)
    private ServicioCatalogo servicio;

    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @Column(name = "id_dueno", nullable = false)
    private Long idDueno;

    @Column(name = "id_veterinario")
    private Long idVeterinario;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private Instant fechaCreacion;

    @PrePersist
    void alCrear() {
        if (fechaCreacion == null) {
            fechaCreacion = Instant.now();
        }
    }

    public boolean estaActiva() {
        return estado != EstadoCita.CANCELADA && estado != EstadoCita.COMPLETADA;
    }
}
