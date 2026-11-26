package cl.VeterinariaSanMarcos.pacientes.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

/** Tabla pacientes.atenciones_clinicas: cada registro es una entrada del historial clínico. */
@Entity
@Table(name = "atenciones_clinicas")
@Getter
@Setter
@NoArgsConstructor
public class AtencionClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atencion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    /** Usuario del personal que registró la atención (id de ms-usuarios). */
    @Column(name = "id_veterinario", nullable = false)
    private Long idVeterinario;

    @Column(name = "fecha_atencion", nullable = false)
    private Instant fechaAtencion;

    @Column(length = 255)
    private String motivo;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "tratamiento_medicamentos", columnDefinition = "TEXT")
    private String tratamientoMedicamentos;

    @Column(columnDefinition = "TEXT")
    private String indicaciones;

    @Column(name = "proximo_control")
    private LocalDate proximoControl;

    @OneToOne(mappedBy = "atencion", cascade = CascadeType.ALL, orphanRemoval = true)
    private Vacuna vacuna;
}
