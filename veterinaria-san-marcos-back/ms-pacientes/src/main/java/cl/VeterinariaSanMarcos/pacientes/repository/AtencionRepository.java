package cl.VeterinariaSanMarcos.pacientes.repository;

import cl.VeterinariaSanMarcos.pacientes.entity.AtencionClinica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AtencionRepository extends JpaRepository<AtencionClinica, Long> {

    Optional<AtencionClinica> findByIdAndPacienteId(Long id, Long idPaciente);
}
