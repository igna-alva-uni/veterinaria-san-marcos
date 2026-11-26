package cl.VeterinariaSanMarcos.commons.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

/** La clínica opera en Rancagua: las fechas civiles se interpretan en la zona de Chile continental. */
public final class Fechas {

    public static final ZoneId ZONA_CLINICA = ZoneId.of("America/Santiago");

    private Fechas() {
    }

    public static LocalDate hoy() {
        return LocalDate.now(ZONA_CLINICA);
    }

    public static Instant aInstante(LocalDate fecha, LocalTime hora) {
        return fecha.atTime(hora).atZone(ZONA_CLINICA).toInstant();
    }

    public static LocalDate fecha(Instant instante) {
        return instante == null ? null : instante.atZone(ZONA_CLINICA).toLocalDate();
    }

    public static LocalTime hora(Instant instante) {
        return instante == null ? null : instante.atZone(ZONA_CLINICA).toLocalTime();
    }
}
