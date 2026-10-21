import { obtenerVacunas, vacunaDeAtencion } from '../data/vacunas.js'
import './historial.css'

export default function HistorialClinico({ mascota }) {
  const historial = [...(mascota.historial || [])].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const vacunas = obtenerVacunas(historial)
  return <div className="clinical-record">
    <section aria-labelledby="vacunas-titulo" className="clinical-section">
      <h2 id="vacunas-titulo">Vacunas y vencimientos</h2>
      <p>Se muestra el estado de la última aplicación registrada de cada vacuna.</p>
      {!vacunas.length ? <p>No hay vacunas registradas.</p> : <ul className="clinical-list">{vacunas.map(v => <li key={v.nombre}>
        <strong>{v.nombre}</strong><span className={`vaccine-state ${v.aviso ? 'vaccine-state--warning' : ''}`}>{v.estado}</span>
        <p>Última aplicación: {v.fecha}</p><p>Vencimiento: {v.vencimiento || 'No registrado'}</p>
      </li>)}</ul>}
    </section>
    <section aria-labelledby="historial-titulo" className="clinical-section">
      <h2 id="historial-titulo">Historial clínico</h2>
      <p>Antecedentes: {mascota.observaciones || 'Sin antecedentes registrados'}</p>
      {!historial.length ? <p>No hay atenciones registradas.</p> : historial.map((h, i) => {
        const vacuna = vacunaDeAtencion(h)
        return <article className="clinical-entry" key={h.id || i}>
          <h3>{h.fecha} · {h.tipo || 'Atención veterinaria'}</h3>
          <p><strong>Diagnóstico:</strong> {h.diagnostico || 'No registrado'}</p>
          <p><strong>Medicamento:</strong> {h.medicamento || 'No indicado'}</p>
          {vacuna && <><p><strong>Vacuna aplicada:</strong> {vacuna.nombre}</p><p><strong>Vencimiento de vacuna:</strong> {vacuna.vencimiento || 'No registrado'}</p></>}
          <p><strong>Indicaciones:</strong> {h.observacion || 'Sin indicaciones'}</p>
          <p><strong>Próximo control:</strong> {h.proximoControl || 'No definido'}</p>
        </article>
      })}
    </section>
  </div>
}
