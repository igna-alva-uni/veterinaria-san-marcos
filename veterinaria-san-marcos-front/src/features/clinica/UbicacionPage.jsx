import { Link } from 'react-router-dom'
import { clinica, ubicacionConfirmada } from '../../data/clinica.js'
import MapaClinica from './MapaClinica.jsx'
import './ClinicaPages.css'

export default function UbicacionPage({ ubicacion = clinica }) {
  const confirmada = ubicacionConfirmada(ubicacion)
  const destino = ubicacion.direccion
  const indicaciones = confirmada ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}` : null
  return (
    <div className="clinic-page">
      <section className="clinic-hero"><span className="clinic-eyebrow">Planifica tu visita</span><h1>Ubicación de la clínica</h1><p>Estamos en {ubicacion.ciudad}, {ubicacion.region}. Consulta nuestra ubicación y prepara tu llegada.</p></section>
      <section className="clinic-section clinic-location-grid" aria-label="Dirección y mapa">
        <div className="clinic-location-card">
          <span className="clinic-eyebrow">Dónde encontrarnos</span><h2>{ubicacion.nombre}</h2>
          <address>{confirmada ? ubicacion.direccion : `${ubicacion.ciudad}, ${ubicacion.region}`}</address>
          {!confirmada && <p className="clinic-pending" role="status">Dirección exacta pendiente de confirmación. El mapa muestra una vista general de Rancagua, no la ubicación de la clínica.</p>}
          {ubicacion.telefono && <p><a href={`tel:${ubicacion.telefono.replace(/[^+\d]/g,'')}`}>{ubicacion.telefono}</a></p>}
          {ubicacion.correo && <p><a href={`mailto:${ubicacion.correo}`}>{ubicacion.correo}</a></p>}
          {ubicacion.horario && <><h3>Horario de atención</h3><p>{ubicacion.horario}</p></>}
          {indicaciones ? <a className="site-button" href={indicaciones} target="_blank" rel="noopener noreferrer">Cómo llegar desde mi ubicación <span aria-hidden="true">↗</span></a> : <p className="clinic-note">Las indicaciones para llegar se habilitarán cuando confirmemos la dirección exacta.</p>}
          <Link className="clinic-text-link" to="/contacto">Consultar con la clínica <span aria-hidden="true">→</span></Link>
        </div>
        <div className="clinic-map-card"><MapaClinica ubicacion={ubicacion} confirmada={confirmada} /><p className="clinic-note">Puedes desplazar el mapa y usar los botones + y − para cambiar el zoom.</p></div>
      </section>
      <section className="clinic-about"><div><span className="clinic-eyebrow">Antes de salir</span><h2>Revisa el estado de tu cita</h2><p>Una solicitud pendiente todavía no es una cita confirmada. Comprueba el horario acordado con recepción antes de acudir.</p></div><Link className="site-button site-button--secondary" to="/mis-citas">Consultar citas <span aria-hidden="true">→</span></Link></section>
    </div>
  )
}
