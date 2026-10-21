import { useState } from "react";

export default function Reportes({ pacientes, usuarios }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const atenciones = pacientes
    .flatMap((x) =>
      (x.historial || []).map((h) => ({ ...h, mascota: x.nombre })),
    )
    .filter(
      (h) => (!desde || h.fecha >= desde) && (!hasta || h.fecha <= hasta),
    );
  return (
    <section className="tarjeta">
      <h1>Reportes administrativos</h1>
      <p>Indicadores calculados a partir de las atenciones registradas.</p>
      <div className="metricas">
        <div>
          <strong>{pacientes.length}</strong>
          <span>Pacientes registrados</span>
        </div>
        <div>
          <strong>{usuarios.filter((u) => u.activo).length}</strong>
          <span>Usuarios activos</span>
        </div>
        <div>
          <strong>{atenciones.length}</strong>
          <span>Atenciones del período</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
        <label>
          Desde
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
      </div>
      <h2>Atenciones registradas</h2>
      {desde && hasta && desde > hasta && (
        <p role="alert">El rango de fechas no es válido.</p>
      )}
      <div className="tabla-contenedor">
        <p className="aviso-deslizamiento">
          ↔ Desliza la tabla hacia los lados para ver más columnas.
        </p>
        <div
          className="tabla overflow-x-auto"
          role="region"
          aria-label="Tabla con desplazamiento horizontal"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left [&_tbody_tr:hover]:bg-[var(--surface-soft)]">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Mascota</th>
                <th>Servicio</th>
                <th>Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              {atenciones.map((h, i) => (
                <tr key={i}>
                  <td>{h.fecha}</td>
                  <td>{h.mascota}</td>
                  <td>{h.tipo}</td>
                  <td>{h.diagnostico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
