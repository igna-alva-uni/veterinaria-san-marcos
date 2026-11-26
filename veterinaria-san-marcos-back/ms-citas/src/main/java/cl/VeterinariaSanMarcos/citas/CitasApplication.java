package cl.VeterinariaSanMarcos.citas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

// ms-citas: agenda de citas, catálogo (servicios y productos) y pedidos de la tienda.
// scanBasePackages incluye cl.VeterinariaSanMarcos.commons (JWT, errores y OpenAPI compartidos).
@SpringBootApplication(scanBasePackages = "cl.VeterinariaSanMarcos")
@EnableFeignClients
public class CitasApplication {

    public static void main(String[] args) {
        SpringApplication.run(CitasApplication.class, args);
    }
}
