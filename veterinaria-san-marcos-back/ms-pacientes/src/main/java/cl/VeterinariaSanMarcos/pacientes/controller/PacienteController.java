package cl.VeterinariaSanMarcos.pacientes.controller;

import cl.VeterinariaSanMarcos.commons.security.UsuarioActual;
import cl.VeterinariaSanMarcos.pacientes.dto.AtencionRequest;
import cl.VeterinariaSanMarcos.pacientes.dto.AtencionResponse;
import cl.VeterinariaSanMarcos.pacientes.dto.ObservacionesRequest;
import cl.VeterinariaSanMarcos.pacientes.dto.PacienteRequest;
import cl.VeterinariaSanMarcos.pacientes.dto.PacienteResponse;
import cl.VeterinariaSanMarcos.pacientes.service.PacienteService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pacientes")
@Tag(name = "Pacientes", description = "Mascotas y su historial clínico. Un dueño solo accede a sus mascotas")
public class PacienteController {

    private final PacienteService servicio;

    public PacienteController(PacienteService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @Operation(summary = "Listar mascotas", description = "Personal: todas (filtro opcional idDueno). Dueño: solo las propias.")
    public List<PacienteResponse> listar(@RequestParam(required = false) Long idDueno) {
        return servicio.listar(UsuarioActual.obtener(), idDueno);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener mascota con historial", description = "403 si un dueño consulta una mascota ajena; 404 si no existe.")
    public PacienteResponse obtener(@PathVariable Long id) {
        return servicio.obtener(id, UsuarioActual.obtener());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('DUENO','ADMINISTRADOR','RECEPCIONISTA','VETERINARIO')")
    @Operation(summary = "Registrar mascota", description = "Un dueño la registra a su nombre; el personal debe indicar idDueno.")
    public PacienteResponse crear(@Valid @RequestBody PacienteRequest solicitud) {
        return servicio.crear(solicitud, UsuarioActual.obtener());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar mascota", description = "Dueño de la mascota o personal de la clínica.")
    public PacienteResponse actualizar(@PathVariable Long id, @Valid @RequestBody PacienteRequest solicitud) {
        return servicio.actualizar(id, solicitud, UsuarioActual.obtener());
    }

    @PatchMapping("/{id}/observaciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','VETERINARIO')")
    @Operation(summary = "Actualizar antecedentes", description = "Antecedentes y observaciones generales de la ficha clínica.")
    public PacienteResponse actualizarObservaciones(@PathVariable Long id, @Valid @RequestBody ObservacionesRequest solicitud) {
        return servicio.actualizarObservaciones(id, solicitud.observaciones(), UsuarioActual.obtener());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar mascota", description = "Dueño, administración o recepción. 409 si tiene citas activas en ms-citas.")
    public void eliminar(@PathVariable Long id) {
        servicio.eliminar(id, UsuarioActual.obtener());
    }

    @GetMapping("/{id}/atenciones")
    @Operation(summary = "Historial clínico de la mascota")
    public List<AtencionResponse> listarAtenciones(@PathVariable Long id) {
        return servicio.listarAtenciones(id, UsuarioActual.obtener());
    }

    @PostMapping("/{id}/atenciones")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','VETERINARIO')")
    @Operation(summary = "Registrar atención", description = "Opcionalmente registra la vacuna aplicada y su vencimiento.")
    public AtencionResponse registrarAtencion(@PathVariable Long id, @Valid @RequestBody AtencionRequest solicitud) {
        return servicio.registrarAtencion(id, solicitud, UsuarioActual.obtener());
    }

    @DeleteMapping("/{id}/atenciones/{idAtencion}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','VETERINARIO')")
    @Operation(summary = "Eliminar atención del historial")
    public void eliminarAtencion(@PathVariable Long id, @PathVariable Long idAtencion) {
        servicio.eliminarAtencion(id, idAtencion);
    }
}
