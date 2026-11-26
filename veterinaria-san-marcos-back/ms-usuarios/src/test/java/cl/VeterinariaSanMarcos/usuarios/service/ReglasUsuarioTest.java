package cl.VeterinariaSanMarcos.usuarios.service;

import cl.VeterinariaSanMarcos.commons.error.ApiException;
import cl.VeterinariaSanMarcos.usuarios.entity.Rol;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ReglasUsuarioTest {

    @Test
    void normalizaRunConPuntosYGuion() {
        assertEquals("12345678-5", ReglasUsuario.normalizarRun("12.345.678-5"));
        assertEquals("11111111-1", ReglasUsuario.normalizarRun("111111111"));
    }

    @Test
    void rechazaDigitoVerificadorIncorrecto() {
        assertThrows(ApiException.class, () -> ReglasUsuario.normalizarRun("12345678-9"));
    }

    @Test
    void calculaDigitoK() {
        // 10.000.013-K es un RUN con dígito verificador K
        assertEquals('K', ReglasUsuario.calcularDigitoVerificador("10000013"));
    }

    @Test
    void exigeDominioSegunRol() {
        assertDoesNotThrow(() -> ReglasUsuario.validarDominio("cliente@profesor.duoc.cl", Rol.DUENO));
        assertThrows(ApiException.class, () -> ReglasUsuario.validarDominio("cliente@gmail.com", Rol.DUENO));
    }
}
