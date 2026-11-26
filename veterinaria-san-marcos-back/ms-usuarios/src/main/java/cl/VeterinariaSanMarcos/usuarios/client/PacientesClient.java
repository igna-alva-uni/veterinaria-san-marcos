package cl.VeterinariaSanMarcos.usuarios.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Comunicación con ms-pacientes a través de Eureka (lb://ms-pacientes).
 * El token del usuario se reenvía con FeignConfig, así ms-pacientes aplica sus propios permisos.
 */
@FeignClient(name = "ms-pacientes")
public interface PacientesClient {

    @GetMapping("/api/v1/pacientes")
    List<Map<String, Object>> listarPorDueno(@RequestParam("idDueno") Long idDueno);
}
