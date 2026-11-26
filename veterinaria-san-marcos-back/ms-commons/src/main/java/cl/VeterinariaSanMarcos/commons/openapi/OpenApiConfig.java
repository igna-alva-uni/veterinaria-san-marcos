package cl.VeterinariaSanMarcos.commons.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Documentación OpenAPI de cada microservicio. El servidor "/" hace que Swagger UI
 * (publicado en el API Gateway) envíe las pruebas a través del gateway, y el esquema
 * "bearerAuth" habilita el botón Authorize para pegar el JWT.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(@Value("${spring.application.name}") String servicio,
                           @Value("${app.openapi.descripcion:API REST de Veterinaria San Marcos}") String descripcion) {
        return new OpenAPI()
                .info(new Info().title("Veterinaria San Marcos · " + servicio).version("v1").description(descripcion))
                .servers(List.of(new Server().url("/").description("API Gateway")))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Token obtenido en POST /api/v1/auth/login")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
