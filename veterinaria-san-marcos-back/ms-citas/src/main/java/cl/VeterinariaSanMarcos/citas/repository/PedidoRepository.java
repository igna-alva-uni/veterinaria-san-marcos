package cl.VeterinariaSanMarcos.citas.repository;

import cl.VeterinariaSanMarcos.citas.entity.Pedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = "detalles")
    List<Pedido> findAllByOrderByFechaCreacionDesc();

    @EntityGraph(attributePaths = "detalles")
    List<Pedido> findByIdUsuarioOrderByFechaCreacionDesc(Long idUsuario);

    boolean existsByNumero(String numero);
}
