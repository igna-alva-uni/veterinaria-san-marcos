package cl.VeterinariaSanMarcos.pacientes.entity;

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

import java.time.LocalDate;

/** Tabla pacientes.historial_vacunas. Se registra junto con la atención en que se aplicó. */
@Entity
@Table(name = "historial_vacunas")
@Getter
@Setter
@NoArgsConstructor
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacuna")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_atencion")
    private AtencionClinica atencion;

    @Column(name = "nombre_vacuna", nullable = false, length = 50)
    private String nombreVacuna;

    @Column(name = "fecha_aplicacion", nullable = false)
    private LocalDate fechaAplicacion;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;
}
