package cl.VeterinariaSanMarcos.citas.repository;

import cl.VeterinariaSanMarcos.citas.entity.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, String> {

    List<Producto> findAllByOrderByCodigoAsc();

    List<Producto> findByActivoTrueOrderByCodigoAsc();

    /**
     * SELECT ... FOR UPDATE: bloquea la fila mientras se descuenta stock, así dos compras
     * simultáneas no pueden vender la misma última unidad.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.codigo = :codigo")
    Optional<Producto> bloquearPorCodigo(@Param("codigo") String codigo);
}
