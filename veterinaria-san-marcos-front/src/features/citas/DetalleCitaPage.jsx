
import { Link, useParams } from 'react-router-dom'
import {
  obtenerCitaPorId,
  obtenerMascotaPorId,
} from '../../data/veterinaria.js'
import './DetalleCitaPage.css'

function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha registrada'

  const fecha = new Date(`${fechaISO}T12:00:00`)

  if (Number.isNaN(fecha.getTime())) return 'Fecha no válida'

  return fecha.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function DetalleCitaPage() {
  const { id } = useParams()
  const cita = obtenerCitaPorId(id)

  if (!cita) {
    return (
      <div className="detalle-cita-page">
        <div className="detalle-cita-contenido">
          <section className="detalle-cita-no-encontrada">
            <span className="detalle-cita-no-encontrada-icono" aria-hidden="true">
              📅
            </span>
            <span className="detalle-cita-etiqueta">
              SAN MARCOS · CENTRO VETERINARIO
            </span>
            <h1>Cita no encontrada</h1>
            <p>
              No encontramos una solicitud con ese identificador. Puedes
              volver al historial para consultar las citas registradas.
            </p>
            <Link to="/mis-citas" className="detalle-cita-boton">
              Volver a mis citas <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>
    )
  }

  const mascota = obtenerMascotaPorId(cita.mascotaId)
  const nombreMascota =
    mascota?.nombre || cita.mascotaNombre || cita.mascota || 'Sin nombre'

  const estado = cita.estado || 'Pendiente de confirmación'

  const estadoClase =
    estado === 'Confirmada'
      ? 'detalle-cita-estado-confirmada'
      : estado === 'Cancelada'
        ? 'detalle-cita-estado-cancelada'
        : 'detalle-cita-estado-pendiente'

  const mensajeEstado =
    estado === 'Pendiente de confirmación'
      ? 'Tu solicitud está pendiente de revisión por recepción. El horario solicitado todavía no representa una cita confirmada.'
      : estado === 'Confirmada'
        ? 'Tu cita figura como confirmada en el sistema. Revisa los datos de la atención antes de asistir.'
        : estado === 'Cancelada'
          ? 'Esta solicitud figura como cancelada. Si todavía necesitas atención, puedes solicitar una nueva cita.'
          : 'Consulta el estado actualizado de tu solicitud en Mis citas.'

  return (
    <div className="detalle-cita-page">
      <div className="detalle-cita-contenido">
        <Link to="/mis-citas" className="detalle-cita-volver">
          <span aria-hidden="true">←</span> Volver a mis citas
        </Link>

        <section className="detalle-cita-portada">
          <div className="detalle-cita-portada-texto">
            <span className="detalle-cita-etiqueta">
              SAN MARCOS · CENTRO VETERINARIO
            </span>
            <h1>Detalle de tu cita</h1>
            <p>
              Consulta la información de la solicitud y revisa su estado
              actual.
            </p>
          </div>
          <div className="detalle-cita-portada-icono" aria-hidden="true">
            📅
            <span>🐾</span>
          </div>
        </section>

        <section className="detalle-cita-tarjeta">
          <div className="detalle-cita-resumen">
            <span className="detalle-cita-icono" aria-hidden="true">
              ✚
            </span>

            <div className="detalle-cita-resumen-texto">
              <span>Servicio solicitado</span>
              <h2>{cita.servicio || 'Servicio no especificado'}</h2>
              <p>
                Atención para <strong>{nombreMascota}</strong>
              </p>
            </div>

            <span className={`detalle-cita-estado ${estadoClase}`}>
              <span aria-hidden="true">●</span>
              {estado}
            </span>
          </div>

          <div className="detalle-cita-separador" />

          <section className="detalle-cita-seccion">
            <div className="detalle-cita-seccion-encabezado">
              <span aria-hidden="true">▦</span>
              <div>
                <h3>Datos de la atención</h3>
                <p>Información registrada en la solicitud.</p>
              </div>
            </div>

            <dl className="detalle-cita-datos">
              <div>
                <dt>Mascota</dt>
                <dd>{nombreMascota}</dd>
              </div>

              <div>
                <dt>Especie</dt>
                <dd>{mascota?.especie || 'No disponible'}</dd>
              </div>

              <div>
                <dt>Servicio</dt>
                <dd>{cita.servicio || 'No especificado'}</dd>
              </div>

              <div>
                <dt>Fecha solicitada</dt>
                <dd>{formatearFecha(cita.fecha)}</dd>
              </div>

              <div>
                <dt>Horario</dt>
                <dd>{cita.hora || 'Sin horario registrado'}</dd>
              </div>

              <div>
                <dt>Identificador de solicitud</dt>
                <dd className="detalle-cita-identificador">#{cita.id}</dd>
              </div>
            </dl>
          </section>

          <section className="detalle-cita-seccion detalle-cita-motivo-seccion">
            <div className="detalle-cita-seccion-encabezado">
              <span aria-hidden="true">▤</span>
              <div>
                <h3>Motivo de consulta</h3>
                <p>Descripción proporcionada al solicitar la atención.</p>
              </div>
            </div>

            <p className="detalle-cita-motivo">
              {cita.motivo?.trim() || 'No se indicó un motivo de consulta.'}
            </p>
          </section>

          <section className={`detalle-cita-aviso ${estadoClase}`}>
            <span className="detalle-cita-aviso-icono" aria-hidden="true">
              {estado === 'Confirmada'
                ? '✓'
                : estado === 'Cancelada'
                  ? '!'
                  : 'i'}
            </span>
            <div>
              <strong>Estado de la solicitud</strong>
              <p>{mensajeEstado}</p>
            </div>
          </section>

          <footer className="detalle-cita-acciones">
            <Link to="/mis-citas" className="detalle-cita-boton">
              <span aria-hidden="true">←</span> Volver a mis citas
            </Link>

            {estado !== 'Cancelada' && (
              <Link
                to={`/citas/nueva?mascotaId=${encodeURIComponent(cita.mascotaId ?? '')}`}
                className="detalle-cita-boton-secundario"
              >
                Solicitar otra cita <span aria-hidden="true">→</span>
              </Link>
            )}
          </footer>
        </section>

        <footer className="detalle-cita-pie">
          <span aria-hidden="true">🐾</span>
          Cada mascota es parte de la familia.
        </footer>
      </div>
    </div>
  )
}

export default DetalleCitaPage
