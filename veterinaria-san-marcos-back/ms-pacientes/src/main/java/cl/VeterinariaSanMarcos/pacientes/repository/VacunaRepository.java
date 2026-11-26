package cl.VeterinariaSanMarcos.pacientes.repository;

import cl.VeterinariaSanMarcos.pacientes.entity.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VacunaRepository extends JpaRepository<Vacuna, Long> {

    /** Vacunas cargadas sin atención asociada (las demás se eliminan en cascada con su atención). */
    @Modifying
    @Query("delete from Vacuna v where v.paciente.id = :idPaciente and v.atencion is null")
    int eliminarSueltasDePaciente(@Param("idPaciente") Long idPaciente);
}
