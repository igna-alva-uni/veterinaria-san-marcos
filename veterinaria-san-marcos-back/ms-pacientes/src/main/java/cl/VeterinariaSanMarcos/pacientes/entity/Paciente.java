package cl.VeterinariaSanMarcos.pacientes.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Tabla pacientes.pacientes. id_dueno referencia a un usuario de ms-usuarios (sin FK entre esquemas). */
@Entity
@Table(name = "pacientes")
@Getter
@Setter
@NoArgsConstructor
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String especie;

    @Column(length = 50)
    private String raza;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "peso_kg", precision = 5, scale = 2)
    private BigDecimal pesoKg;

    /** 'M' o 'F' (CHECK en la tabla); null si no se especificó. */
    @Column(length = 1)
    private Character genero;

    @Column(name = "id_dueno", nullable = false)
    private Long idDueno;

    @Column(columnDefinition = "TEXT")
    private String anotaciones;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private Instant fechaRegistro;

    /** Al eliminar el paciente se elimina su historial clínico (y las vacunas ligadas a cada atención). */
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fechaAtencion DESC")
    private List<AtencionClinica> atenciones = new ArrayList<>();

    @PrePersist
    void alCrear() {
        if (fechaRegistro == null) {
            fechaRegistro = Instant.now();
        }
    }
}
