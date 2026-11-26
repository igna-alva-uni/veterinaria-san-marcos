package cl.VeterinariaSanMarcos.usuarios.config;

import cl.VeterinariaSanMarcos.commons.security.SeguridadComun;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Reglas de ms-usuarios: login y registro son públicos; todo lo demás exige JWT.
 * Los permisos por rol se declaran con @PreAuthorize en cada endpoint.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filtroSeguridad(HttpSecurity http, SeguridadComun seguridadComun) throws Exception {
        seguridadComun.aplicar(http)
                .authorizeHttpRequests(reglas -> reglas
                        .requestMatchers(SeguridadComun.RUTAS_PUBLICAS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/registro").permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }

    /** BCrypt: las contraseñas se guardan con hash y sal, nunca en texto plano. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
