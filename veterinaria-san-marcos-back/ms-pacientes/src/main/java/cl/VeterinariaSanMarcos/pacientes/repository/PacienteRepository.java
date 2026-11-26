package cl.VeterinariaSanMarcos.pacientes.repository;

import cl.VeterinariaSanMarcos.pacientes.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    List<Paciente> findAllByOrderByNombreAsc();

    List<Paciente> findByIdDuenoOrderByNombreAsc(Long idDueno);
}
