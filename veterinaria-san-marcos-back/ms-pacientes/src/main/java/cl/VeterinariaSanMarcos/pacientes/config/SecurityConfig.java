package cl.VeterinariaSanMarcos.pacientes.config;

import cl.VeterinariaSanMarcos.commons.security.SeguridadComun;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/** Todos los endpoints de pacientes requieren JWT. Los roles se controlan con @PreAuthorize y en el servicio. */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filtroSeguridad(HttpSecurity http, SeguridadComun seguridadComun) throws Exception {
        seguridadComun.aplicar(http)
                .authorizeHttpRequests(reglas -> reglas
                        .requestMatchers(SeguridadComun.RUTAS_PUBLICAS).permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
