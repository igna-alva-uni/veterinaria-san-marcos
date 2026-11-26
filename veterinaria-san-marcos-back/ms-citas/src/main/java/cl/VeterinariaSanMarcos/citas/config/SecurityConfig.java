package cl.VeterinariaSanMarcos.citas.config;

import cl.VeterinariaSanMarcos.commons.security.SeguridadComun;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * El catálogo (servicios y productos) se puede consultar sin sesión.
 * Citas, pedidos y cualquier modificación del catálogo requieren JWT y el rol indicado en cada endpoint.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filtroSeguridad(HttpSecurity http, SeguridadComun seguridadComun) throws Exception {
        seguridadComun.aplicar(http)
                .authorizeHttpRequests(reglas -> reglas
                        .requestMatchers(SeguridadComun.RUTAS_PUBLICAS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/servicios/**", "/api/v1/productos/**").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
