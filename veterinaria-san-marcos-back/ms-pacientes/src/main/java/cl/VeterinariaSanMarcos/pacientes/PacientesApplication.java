package cl.VeterinariaSanMarcos.pacientes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

// scanBasePackages incluye cl.VeterinariaSanMarcos.commons (JWT, errores y OpenAPI compartidos).
@SpringBootApplication(scanBasePackages = "cl.VeterinariaSanMarcos")
@EnableFeignClients
public class PacientesApplication {

    public static void main(String[] args) {
        SpringApplication.run(PacientesApplication.class, args);
    }
}
