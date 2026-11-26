package cl.VeterinariaSanMarcos.pacientes.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/** Consulta a ms-citas (vía Eureka) si una mascota tiene citas activas antes de eliminarla. */
@FeignClient(name = "ms-citas")
public interface CitasClient {

    @GetMapping("/api/v1/citas")
    List<Map<String, Object>> citasActivasDePaciente(@RequestParam("idPaciente") Long idPaciente,
                                                     @RequestParam("activas") boolean activas);
}
