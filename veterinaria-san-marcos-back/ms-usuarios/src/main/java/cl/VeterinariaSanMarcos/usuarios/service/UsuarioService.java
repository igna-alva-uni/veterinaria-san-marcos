package cl.VeterinariaSanMarcos.usuarios.service;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.commons.security.UsuarioAutenticado;
import cl.VeterinariaSanMarcos.usuarios.client.PacientesClient;
import cl.VeterinariaSanMarcos.usuarios.dto.PerfilRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioRequest;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioResponse;
import cl.VeterinariaSanMarcos.usuarios.dto.UsuarioUpdateRequest;
import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import cl.VeterinariaSanMarcos.usuarios.entity.Usuario;
import cl.VeterinariaSanMarcos.usuarios.repository.UsuarioRepository;
import feign.FeignException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;
    private final PacientesClient pacientesClient;

    public UsuarioService(UsuarioRepository repositorio, PasswordEncoder passwordEncoder, PacientesClient pacientesClient) {
        this.repositorio = repositorio;
        this.passwordEncoder = passwordEncoder;
        this.pacientesClient = pacientesClient;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(Rol rol) {
        List<Usuario> usuarios = rol == null ? repositorio.findAllByOrderByIdAsc() : repositorio.findByRolOrderByNombreAsc(rol);
        return usuarios.stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id, UsuarioAutenticado actual) {
        if (!actual.esPersonal() && !Objects.equals(actual.id(), id)) {
            throw ApiException.prohibido("Solo puedes consultar tu propia cuenta.");
        }
        return UsuarioResponse.desde(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest solicitud) {
        String email = ReglasUsuario.normalizarCorreo(solicitud.email());
        String run = ReglasUsuario.normalizarRun(solicitud.run());
        ReglasUsuario.validarDominio(email, solicitud.rol());
        if (repositorio.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflicto("Ya existe un usuario con ese correo.");
        }
        if (repositorio.existsByRun(run)) {
            throw ApiException.conflicto("Ya existe un usuario con ese RUN.");
        }
        Usuario usuario = new Usuario();
        usuario.setRun(run);
        usuario.setNombre(solicitud.nombre().trim());
        usuario.setApellido(solicitud.apellido().trim());
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(solicitud.password()));
        usuario.setRol(solicitud.rol());
        usuario.setTelefono(ReglasUsuario.limpiarTelefono(solicitud.telefono()));
        usuario.setActivo(true);
        return UsuarioResponse.desde(repositorio.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest solicitud, UsuarioAutenticado actual) {
        Usuario usuario = buscar(id);
        String email = ReglasUsuario.normalizarCorreo(solicitud.email());
        boolean propio = Objects.equals(actual.id(), id);
        // Un administrador no puede quitarse su propio rol y quedar sin acceso a la administración.
        Rol rol = propio ? usuario.getRol() : solicitud.rol();
        ReglasUsuario.validarDominio(email, rol);
        if (repositorio.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw ApiException.conflicto("Ya existe un usuario con ese correo.");
        }
        usuario.setNombre(solicitud.nombre().trim());
        usuario.setApellido(solicitud.apellido().trim());
        usuario.setEmail(email);
        usuario.setRol(rol);
        usuario.setTelefono(ReglasUsuario.limpiarTelefono(solicitud.telefono()));
        return UsuarioResponse.desde(usuario);
    }

    @Transactional
    public UsuarioResponse actualizarPerfil(UsuarioAutenticado actual, PerfilRequest solicitud) {
        Usuario usuario = buscar(actual.id());
        usuario.setNombre(solicitud.nombre().trim());
        usuario.setApellido(solicitud.apellido().trim());
        usuario.setTelefono(ReglasUsuario.limpiarTelefono(solicitud.telefono()));
        return UsuarioResponse.desde(usuario);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo, UsuarioAutenticado actual) {
        if (Objects.equals(actual.id(), id)) {
            throw ApiException.conflicto("No puedes desactivar tu propia cuenta.");
        }
        Usuario usuario = buscar(id);
        usuario.setActivo(activo);
        return UsuarioResponse.desde(usuario);
    }

    /**
     * Elimina físicamente solo cuentas de clientes sin mascotas registradas.
     * Al personal se le desactiva la cuenta para conservar la trazabilidad de sus atenciones.
     */
    @Transactional
    public void eliminar(Long id, UsuarioAutenticado actual) {
        if (Objects.equals(actual.id(), id)) {
            throw ApiException.conflicto("No puedes eliminar tu propia cuenta.");
        }
        Usuario usuario = buscar(id);
        if (usuario.getRol() != Rol.DUENO) {
            throw ApiException.conflicto("Solo se pueden eliminar clientes desde esta opción");
        }
        int mascotas;
        try {
            mascotas = pacientesClient.listarPorDueno(id).size();
        } catch (FeignException e) {
            throw ApiException.servicioNoDisponible("No se pudo verificar si el cliente tiene mascotas. Intenta nuevamente.");
        }
        if (mascotas > 0) {
            throw ApiException.conflicto("No puedes eliminar este cliente porque tiene mascotas registradas");
        }
        repositorio.delete(usuario);
    }

    private Usuario buscar(Long id) {
        return repositorio.findById(id).orElseThrow(() -> ApiException.noEncontrado("No se encontró el usuario " + id + "."));
    }
}
