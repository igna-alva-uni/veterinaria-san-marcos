package cl.VeterinariaSanMarcos.usuarios;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.datasource.url=jdbc:h2:mem:usuarios",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.default_schema=PUBLIC",
    // En H2 el esquema lo genera Hibernate a partir de las entidades.
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=clave-de-pruebas-con-mas-de-32-caracteres-123"
})
class UsuariosApplicationTests {

    @Test
    void contextLoads() {
    }
}
