package cl.VeterinariaSanMarcos.citas.controller;

import cl.VeterinariaSanMarcos.citas.dto.CitaRequest;
import cl.VeterinariaSanMarcos.citas.dto.CitaResponse;
import cl.VeterinariaSanMarcos.citas.dto.EstadoCitaRequest;
import cl.VeterinariaSanMarcos.citas.dto.ReprogramarRequest;
import cl.VeterinariaSanMarcos.citas.service.CitaService;
import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
@Tag(name = "Citas", description = "Solicitudes de atención. Dueño: crea y cancela las propias. Recepción/administración: confirma y reprograma")
public class CitaController {

    private final CitaService servicio;

    public CitaController(CitaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @Operation(summary = "Listar citas", description = "Personal: todas. Dueño: solo las suyas. Filtros: idPaciente y activas=true.")
    public List<CitaResponse> listar(@RequestParam(required = false) Long idPaciente,
                                     @RequestParam(defaultValue = "false") boolean activas) {
        return servicio.listar(UsuarioActual.obtener(), idPaciente, activas);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cita")
    public CitaResponse obtener(@PathVariable Long id) {
        return servicio.obtener(id, UsuarioActual.obtener());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('DUENO','ADMINISTRADOR','RECEPCIONISTA')")
    @Operation(summary = "Solicitar cita", description = "Valida horario, servicio, especie, propiedad de la mascota (ms-pacientes) y disponibilidad (409).")
    public CitaResponse crear(@Valid @RequestBody CitaRequest solicitud) {
        return servicio.crear(solicitud, UsuarioActual.obtener());
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado", description = "SOLICITADA, CONFIRMADA, COMPLETADA o CANCELADA. Un dueño solo puede cancelar.")
    public CitaResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoCitaRequest solicitud) {
        return servicio.cambiarEstado(id, solicitud.estado(), UsuarioActual.obtener());
    }

    @PatchMapping("/{id}/reprogramar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
    @Operation(summary = "Reprogramar cita", description = "Cambia fecha y hora; la cita vuelve a quedar pendiente de confirmación.")
    public CitaResponse reprogramar(@PathVariable Long id, @Valid @RequestBody ReprogramarRequest solicitud) {
        return servicio.reprogramar(id, solicitud.fecha(), solicitud.hora(), UsuarioActual.obtener());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar cita", description = "Solo administración. Para el flujo normal se recomienda cancelar.")
    public void eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
    }
}
