package cl.VeterinariaSanMarcos.citas.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Llamada a ms-pacientes vía Eureka. Como se reenvía el JWT del usuario, ms-pacientes
 * responde 403 si un dueño intenta usar una mascota ajena.
 */
@FeignClient(name = "ms-pacientes")
public interface PacientesClient {

    @GetMapping("/api/v1/pacientes/{id}")
    PacienteResumen obtener(@PathVariable("id") Long id);

    record PacienteResumen(Long id, String nombre, String especie, Long duenoId) {
    }
}
