package cl.VeterinariaSanMarcos.pacientes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:pacientes",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.default_schema=PUBLIC"
})
class PacientesApplicationTests {

    @Test
    void contextLoads() {
    }
}
