package cl.VeterinariaSanMarcos.usuarios.config;

import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import cl.VeterinariaSanMarcos.usuarios.entity.Usuario;
import cl.VeterinariaSanMarcos.usuarios.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Crea las cuentas de demostración cuando la tabla está vacía. Se hace en Java y no en SQL
 * para guardar las contraseñas con el mismo BCrypt que usa el login.
 * Los ids quedan 1, 2 y 3; el cliente (id 3) es el dueño de las mascotas de 02-pacientes.sql.
 */
@Configuration
public class DatosDemo {

    private static final Logger log = LoggerFactory.getLogger(DatosDemo.class);

    @Bean
    @ConditionalOnProperty(name = "app.demo.cargar-usuarios", havingValue = "true", matchIfMissing = true)
    ApplicationRunner cargarUsuariosDemo(UsuarioRepository repositorio, PasswordEncoder encoder) {
        return args -> {
            if (repositorio.count() > 0) {
                return;
            }
            repositorio.save(crear("11111111-1", "Administración", "San Marcos", "admin@duocuc.cl",
                    encoder.encode("Admin12345"), Rol.ADMINISTRADOR, "+56 9 1111 1111"));
            repositorio.save(crear("22222222-2", "Recepción", "San Marcos", "recepcion@gmail.com",
                    encoder.encode("Recepcion123"), Rol.RECEPCIONISTA, "+56 9 2222 2222"));
            repositorio.save(crear("33333333-3", "Cliente", "Demo", "cliente@profesor.duoc.cl",
                    encoder.encode("Cliente123"), Rol.DUENO, "+56 9 3333 3333"));
            log.info("Usuarios de demostración creados (administración, recepción y cliente).");
        };
    }

    private static Usuario crear(String run, String nombre, String apellido, String email,
                                 String hash, Rol rol, String telefono) {
        Usuario usuario = new Usuario();
        usuario.setRun(run);
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setEmail(email);
        usuario.setPassword(hash);
        usuario.setRol(rol);
        usuario.setTelefono(telefono);
        usuario.setActivo(true);
        return usuario;
    }
}
