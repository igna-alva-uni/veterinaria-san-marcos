package cl.VeterinariaSanMarcos.usuarios.repository;

import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import cl.VeterinariaSanMarcos.usuarios.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByRun(String run);

    boolean existsByRunAndIdNot(String run, Long id);

    List<Usuario> findAllByOrderByIdAsc();

    List<Usuario> findByRolOrderByNombreAsc(Rol rol);
}
