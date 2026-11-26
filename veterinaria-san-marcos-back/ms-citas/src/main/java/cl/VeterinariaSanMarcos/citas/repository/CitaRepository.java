package cl.VeterinariaSanMarcos.citas.repository;

import cl.VeterinariaSanMarcos.citas.entity.Cita;
import cl.VeterinariaSanMarcos.citas.entity.EstadoCita;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    @EntityGraph(attributePaths = "servicio")
    List<Cita> findAllByOrderByFechaHoraAsc();

    @EntityGraph(attributePaths = "servicio")
    List<Cita> findByIdDuenoOrderByFechaHoraAsc(Long idDueno);

    /** Regla de agenda: un mismo horario no puede tener dos citas que no estén canceladas. */
    boolean existsByFechaHoraAndEstadoNot(Instant fechaHora, EstadoCita estado);

    boolean existsByFechaHoraAndEstadoNotAndIdNot(Instant fechaHora, EstadoCita estado, Long id);

    boolean existsByServicioCodigo(String codigoServicio);
}
