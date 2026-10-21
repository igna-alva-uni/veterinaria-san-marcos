import { Link } from 'react-router-dom'
import { avisosDeVacunas } from '../data/vacunas.js'
import './historial.css'

export default function AvisosVacunas({ pacientes = [], usuario }) {
  if (usuario?.rol !== 'Dueño') return null
  const avisos = avisosDeVacunas(pacientes.filter(p => String(p.duenoId) === String(usuario.id)))
  return <section aria-labelledby="avisos-vacunas-titulo" className="clinical-section vaccine-notices">
    <h2 id="avisos-vacunas-titulo">Avisos de vacunas</h2>
    <p>Revisa las vacunas vencidas o que vencen en los próximos 30 días.</p>
    {!avisos.length ? <p>No tienes vacunas próximas a vencer ni vencidas registradas.</p> : <ul className="clinical-list">{avisos.map(v => <li key={`${v.mascotaId}-${v.nombre}`}>
      <strong>{v.mascotaNombre} · {v.nombre}</strong><span className="vaccine-state vaccine-state--warning">{v.estado}</span>
      <p>Vencimiento: {v.vencimiento}</p>
      <div className="clinical-links"><Link to={`/mascotas/${v.mascotaId}`}>Ver historial de {v.mascotaNombre}</Link><Link to={`/citas/nueva?mascotaId=${v.mascotaId}`}>Solicitar cita</Link></div>
    </li>)}</ul>}
  </section>
}
