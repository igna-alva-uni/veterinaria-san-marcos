import { Link } from 'react-router-dom'

const formatoPrecio = precio => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(precio)

export default function ServicioCard({ servicio, rol }) {
  return (
    <article className="clinic-service-card">
      <span className="clinic-eyebrow">{servicio.categoria}</span>
      <h3>{servicio.nombre}</h3>
      <p>{servicio.especie}</p>
      <div className="clinic-service-meta"><span>{servicio.duracion}</span><strong>{formatoPrecio(servicio.precio)}</strong></div>
      <Link className="clinic-text-link" to={rol === 'Dueño' ? `/citas/nueva?servicio=${servicio.codigo}` : '/recepcion/solicitudes'}>
        {rol === 'Dueño' ? 'Solicitar esta atención' : 'Gestionar solicitudes'} <span aria-hidden="true">↗</span>
      </Link>
    </article>
  )
}
