package cl.VeterinariaSanMarcos.citas.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Reenvía el JWT de la petición original a las llamadas entre microservicios. */
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor reenviarToken() {
        return plantilla -> {
            if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos) {
                HttpServletRequest request = atributos.getRequest();
                String token = request.getHeader(HttpHeaders.AUTHORIZATION);
                if (token != null) {
                    plantilla.header(HttpHeaders.AUTHORIZATION, token);
                }
            }
        };
    }
}
