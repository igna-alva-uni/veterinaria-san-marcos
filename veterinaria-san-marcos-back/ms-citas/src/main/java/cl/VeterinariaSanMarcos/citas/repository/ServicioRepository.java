package cl.VeterinariaSanMarcos.citas.repository;

import cl.VeterinariaSanMarcos.citas.entity.ServicioCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioRepository extends JpaRepository<ServicioCatalogo, String> {

    List<ServicioCatalogo> findAllByOrderByCodigoAsc();

    List<ServicioCatalogo> findByActivoTrueOrderByCodigoAsc();
}
