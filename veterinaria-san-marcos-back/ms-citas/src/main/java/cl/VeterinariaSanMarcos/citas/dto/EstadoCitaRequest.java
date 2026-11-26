package cl.VeterinariaSanMarcos.citas.dto;

import cl.VeterinariaSanMarcos.citas.entity.EstadoCita;
import jakarta.validation.constraints.NotNull;

public record EstadoCitaRequest(@NotNull(message = "Indica el nuevo estado") EstadoCita estado) {
}
