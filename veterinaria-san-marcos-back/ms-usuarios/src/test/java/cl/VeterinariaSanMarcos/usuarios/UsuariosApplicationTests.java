package cl.VeterinariaSanMarcos.usuarios;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:usuarios",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.default_schema=PUBLIC"
})
class UsuariosApplicationTests {

    @Test
    void contextLoads() {
    }
}
