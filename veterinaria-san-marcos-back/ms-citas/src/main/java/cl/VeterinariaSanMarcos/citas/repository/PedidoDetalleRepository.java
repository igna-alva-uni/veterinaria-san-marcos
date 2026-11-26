package cl.VeterinariaSanMarcos.citas.repository;

import cl.VeterinariaSanMarcos.citas.entity.PedidoDetalle;
import cl.VeterinariaSanMarcos.citas.entity.TipoItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoDetalleRepository extends JpaRepository<PedidoDetalle, Long> {

    boolean existsByTipoItemAndCodigoItem(TipoItem tipoItem, String codigoItem);
}
