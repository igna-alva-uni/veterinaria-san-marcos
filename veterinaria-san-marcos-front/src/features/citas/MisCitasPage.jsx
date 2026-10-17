
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { obtenerCitas } from '../../data/veterinaria.js'
import './MisCitasPage.css'

function formatoFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha'

  const fecha = new Date(`${fechaISO}T12:00:00`)

  if (Number.isNaN(fecha.getTime())) return 'Fecha no válida'

  return fecha.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function claseEstado(estado) {
  if (estado === 'Confirmada') return 'estado-confirmada'
  if (estado === 'Cancelada') return 'estado-cancelada'
  return 'estado-pendiente'
}

function MisCitasPage() {
  const location = useLocation()
  const [citas, setCitas] = useState(() => obtenerCitas())
  const [filtro, setFiltro] = useState('Todas')

  const cargarCitas = useCallback(() => {
    setCitas(obtenerCitas())
  }, [])

  useEffect(() => {
    cargarCitas()
  }, [location.key, cargarCitas])

  useEffect(() => {
    function actualizarAlCambiarPestana() {
      cargarCitas()
    }

    window.addEventListener('focus', actualizarAlCambiarPestana)
    window.addEventListener('storage', actualizarAlCambiarPestana)

    return () => {
      window.removeEventListener('focus', actualizarAlCambiarPestana)
      window.removeEventListener('storage', actualizarAlCambiarPestana)
    }
  }, [cargarCitas])

  const citasFiltradas = citas.filter((cita) => {
    if (filtro === 'Todas') return true
    if (filtro === 'Activas') return cita.estado !== 'Cancelada'
    return cita.estado === filtro
  })

  const pendientes = citas.filter(
    (cita) => cita.estado === 'Pendiente de confirmación',
  ).length

  const confirmadas = citas.filter(
    (cita) => cita.estado === 'Confirmada',
  ).length

  const canceladas = citas.filter(
    (cita) => cita.estado === 'Cancelada',
  ).length

  const filtros = [
    { nombre: 'Todas', cantidad: citas.length },
    { nombre: 'Activas', cantidad: citas.length - canceladas },
    { nombre: 'Pendiente de confirmación', cantidad: pendientes },
    { nombre: 'Confirmada', cantidad: confirmadas },
    { nombre: 'Cancelada', cantidad: canceladas },
  ]

  return (
    <main className="mis-citas-page">
      <div className="mis-citas-contenido">
        <section className="mis-citas-portada">
          <div className="mis-citas-portada-texto">
            <span className="mis-citas-etiqueta">
              SAN MARCOS · CENTRO VETERINARIO
            </span>
            <h1>Mis citas</h1>
            <p>
              Todas las solicitudes de atención de tus mascotas,
              organizadas en un solo lugar.
            </p>
            <Link className="mis-citas-boton-nueva" to="/citas/nueva">
              <span aria-hidden="true">+</span> Solicitar una cita
            </Link>
          </div>

          <div className="mis-citas-portada-ilustracion" aria-hidden="true">
            <span>📅</span>
            <span className="mis-citas-portada-huella">🐾</span>
          </div>
        </section>

        <section
          className="mis-citas-resumen"
          aria-label="Resumen de citas"
        >
          <article className="mis-citas-resumen-card resumen-total">
            <span className="mis-citas-icono">▦</span>
            <div>
              <span>Total de solicitudes</span>
              <strong>{citas.length}</strong>
              <small>Historial completo</small>
            </div>
          </article>

          <article className="mis-citas-resumen-card resumen-pendiente">
            <span className="mis-citas-icono pendiente">◷</span>
            <div>
              <span>Pendientes</span>
              <strong>{pendientes}</strong>
              <small>Esperando confirmación</small>
            </div>
          </article>

          <article className="mis-citas-resumen-card resumen-confirmada">
            <span className="mis-citas-icono confirmada">✓</span>
            <div>
              <span>Confirmadas</span>
              <strong>{confirmadas}</strong>
              <small>Atenciones confirmadas</small>
            </div>
          </article>
        </section>

        <section className="mis-citas-listado">
          <header className="mis-citas-listado-header">
            <div>
              <span className="mis-citas-etiqueta">TU HISTORIAL</span>
              <h2>Historial de solicitudes</h2>
              <p>
                {citasFiltradas.length === 1
                  ? '1 solicitud encontrada'
                  : `${citasFiltradas.length} solicitudes encontradas`}
              </p>
            </div>
          </header>

          <div className="mis-citas-filtros" aria-label="Filtrar citas">
            {filtros.map((opcion) => (
              <button
                key={opcion.nombre}
                type="button"
                className={filtro === opcion.nombre ? 'filtro-activo' : ''}
                onClick={() => setFiltro(opcion.nombre)}
                aria-pressed={filtro === opcion.nombre}
              >
                {opcion.nombre}
                <span>{opcion.cantidad}</span>
              </button>
            ))}
          </div>

          {citasFiltradas.length === 0 ? (
            <div className="mis-citas-vacio">
              <span className="mis-citas-vacio-icono" aria-hidden="true">
                🐾
              </span>
              <h3>
                {citas.length === 0
                  ? 'Todavía no tienes citas'
                  : 'No hay citas con este filtro'}
              </h3>
              <p>
                {citas.length === 0
                  ? 'Cuando solicites una atención, podrás revisar aquí su fecha y estado.'
                  : 'Prueba con otro filtro para consultar tus solicitudes.'}
              </p>
              {citas.length === 0 ? (
                <Link className="mis-citas-boton-nueva" to="/citas/nueva">
                  Solicitar mi primera cita
                </Link>
              ) : (
                <button
                  className="mis-citas-boton-secundario"
                  type="button"
                  onClick={() => setFiltro('Todas')}
                >
                  Ver todas las citas
                </button>
              )}
            </div>
          ) : (
            <div className="mis-citas-tabla-contenedor">
              <table className="mis-citas-tabla">
                <thead>
                  <tr>
                    <th>Mascota</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        <div className="mis-citas-mascota">
                          <span aria-hidden="true">🐾</span>
                          <strong>
                            {cita.mascotaNombre || cita.mascota || 'Sin nombre'}
                          </strong>
                        </div>
                      </td>
                      <td>{cita.servicio || 'Sin servicio'}</td>
                      <td>{formatoFecha(cita.fecha)}</td>
                      <td>{cita.hora || 'Sin hora'}</td>
                      <td>
                        <span
                          className={`mis-citas-estado ${claseEstado(cita.estado)}`}
                        >
                          <span aria-hidden="true">●</span>
                          {cita.estado || 'Pendiente de confirmación'}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="mis-citas-ver"
                          to={`/mis-citas/${cita.id}`}
                        >
                          Ver detalle <span aria-hidden="true">→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mis-citas-pie">
          <span aria-hidden="true">🐾</span>
          <p>Cada mascota es parte de la familia.</p>
        </footer>
      </div>
    </main>
  )
}

export default MisCitasPage
