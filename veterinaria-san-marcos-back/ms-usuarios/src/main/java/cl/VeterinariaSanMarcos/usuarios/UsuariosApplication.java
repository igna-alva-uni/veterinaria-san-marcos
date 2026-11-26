package cl.VeterinariaSanMarcos.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

// scanBasePackages incluye cl.VeterinariaSanMarcos.commons (JWT, errores y OpenAPI compartidos).
@SpringBootApplication(scanBasePackages = "cl.VeterinariaSanMarcos")
@EnableFeignClients
public class UsuariosApplication {

    public static void main(String[] args) {
        SpringApplication.run(UsuariosApplication.class, args);
    }
}
