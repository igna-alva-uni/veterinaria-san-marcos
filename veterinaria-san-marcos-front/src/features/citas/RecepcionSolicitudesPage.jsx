
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  actualizarEstadoCita,
  obtenerCitas,
  reprogramarCita,
} from '../../data/veterinaria.js'
import './RecepcionSolicitudesPage.css'

const horarios = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '15:00',
  '16:00',
  '17:00',
]

function fechaLocal() {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function formatearFecha(fechaISO) {
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

function RecepcionSolicitudesPage() {
  const [citas, setCitas] = useState(() => obtenerCitas())
  const [filtro, setFiltro] = useState('Pendiente de confirmación')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('exito')
  const [citaReprogramar, setCitaReprogramar] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  function actualizarListado() {
    setCitas(obtenerCitas())
  }

  function confirmarCita(id) {
    const resultado = actualizarEstadoCita(id, 'Confirmada')

    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      setTipoMensaje('error')
      return
    }

    actualizarListado()
    setMensaje('La cita se confirmó correctamente.')
    setTipoMensaje('exito')
  }

  function cancelarCita(id) {
    const confirmar = window.confirm(
      '¿Seguro que quieres cancelar esta cita?',
    )

    if (!confirmar) return

    const resultado = actualizarEstadoCita(id, 'Cancelada')

    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      setTipoMensaje('error')
      return
    }

    actualizarListado()
    setMensaje('La cita se canceló correctamente.')
    setTipoMensaje('exito')

    if (String(citaReprogramar) === String(id)) {
      cerrarReprogramacion()
    }
  }

  function abrirReprogramacion(cita) {
    setCitaReprogramar(cita.id)
    setNuevaFecha(cita.fecha || '')
    setNuevaHora(cita.hora || '')
    setMensaje('')
  }

  function cerrarReprogramacion() {
    setCitaReprogramar(null)
    setNuevaFecha('')
    setNuevaHora('')
  }

  function guardarReprogramacion(event, cita) {
    event.preventDefault()

    if (!nuevaFecha || !nuevaHora) {
      setMensaje('Selecciona la nueva fecha y el nuevo horario.')
      setTipoMensaje('error')
      return
    }

    if (nuevaFecha < fechaLocal()) {
      setMensaje('La nueva fecha debe ser hoy o posterior.')
      setTipoMensaje('error')
      return
    }

    const resultado = reprogramarCita(cita.id, nuevaFecha, nuevaHora)

    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      setTipoMensaje('error')
      return
    }

    actualizarListado()
    cerrarReprogramacion()
    setMensaje(
      'La cita se reprogramó. Quedó pendiente de una nueva confirmación.',
    )
    setTipoMensaje('exito')
  }

  const citasFiltradas = citas.filter((cita) => {
    if (filtro === 'Todas') return true
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
    { valor: 'Pendiente de confirmación', etiqueta: 'Pendientes', cantidad: pendientes },
    { valor: 'Todas', etiqueta: 'Todas', cantidad: citas.length },
    { valor: 'Confirmada', etiqueta: 'Confirmadas', cantidad: confirmadas },
    { valor: 'Cancelada', etiqueta: 'Canceladas', cantidad: canceladas },
  ]

  return (
    <main className="recepcion-solicitudes-page">
      <div className="recepcion-solicitudes-contenido">
        <section className="recepcion-solicitudes-portada">
          <div className="recepcion-solicitudes-portada-texto">
            <span className="recepcion-solicitudes-etiqueta">
              SAN MARCOS · PANEL DE GESTIÓN
            </span>
            <h1>Recepción de citas</h1>
            <p>
              Administra las solicitudes de atención, confirma horarios y
              mantén organizada la agenda veterinaria.
            </p>
          </div>

          <div
            className="recepcion-solicitudes-portada-icono"
            aria-hidden="true"
          >
            📋
            <span>🐾</span>
          </div>
        </section>

        {mensaje && (
          <div
            className={`recepcion-solicitudes-mensaje ${
              tipoMensaje === 'error' ? 'mensaje-error' : 'mensaje-exito'
            }`}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true">
              {tipoMensaje === 'error' ? '!' : '✓'}
            </span>
            <p>{mensaje}</p>
            <button
              type="button"
              aria-label="Cerrar mensaje"
              onClick={() => setMensaje('')}
            >
              ×
            </button>
          </div>
        )}

        <section
          className="recepcion-solicitudes-resumen"
          aria-label="Resumen de solicitudes"
        >
          <article className="recepcion-resumen-card resumen-total">
            <span className="recepcion-resumen-icono" aria-hidden="true">
              ▦
            </span>
            <div>
              <span>Total de solicitudes</span>
              <strong>{citas.length}</strong>
              <small>Registradas en el sistema</small>
            </div>
          </article>

          <article className="recepcion-resumen-card resumen-pendiente">
            <span className="recepcion-resumen-icono" aria-hidden="true">
              ◷
            </span>
            <div>
              <span>Pendientes</span>
              <strong>{pendientes}</strong>
              <small>Requieren revisión</small>
            </div>
          </article>

          <article className="recepcion-resumen-card resumen-confirmada">
            <span className="recepcion-resumen-icono" aria-hidden="true">
              ✓
            </span>
            <div>
              <span>Confirmadas</span>
              <strong>{confirmadas}</strong>
              <small>Atenciones confirmadas</small>
            </div>
          </article>

          <article className="recepcion-resumen-card resumen-cancelada">
            <span className="recepcion-resumen-icono" aria-hidden="true">
              ×
            </span>
            <div>
              <span>Canceladas</span>
              <strong>{canceladas}</strong>
              <small>Solicitudes canceladas</small>
            </div>
          </article>
        </section>

        <section className="recepcion-solicitudes-panel">
          <header className="recepcion-solicitudes-panel-encabezado">
            <div>
              <span className="recepcion-solicitudes-etiqueta">
                ADMINISTRACIÓN
              </span>
              <h2>Solicitudes registradas</h2>
              <p>
                Revisa los datos y selecciona una acción para cada solicitud.
              </p>
            </div>

            <span className="recepcion-solicitudes-total">
              {citasFiltradas.length}{' '}
              {citasFiltradas.length === 1 ? 'solicitud' : 'solicitudes'}
            </span>
          </header>

          <div className="recepcion-solicitudes-filtros" aria-label="Filtrar solicitudes">
            {filtros.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                className={filtro === opcion.valor ? 'filtro-activo' : ''}
                onClick={() => setFiltro(opcion.valor)}
                aria-pressed={filtro === opcion.valor}
              >
                {opcion.etiqueta}
                <span>{opcion.cantidad}</span>
              </button>
            ))}
          </div>

          {citasFiltradas.length === 0 ? (
            <div className="recepcion-solicitudes-vacio">
              <span aria-hidden="true">📅</span>
              <h3>No hay solicitudes para mostrar</h3>
              <p>
                Cuando existan citas con este estado, aparecerán en este
                listado.
              </p>
              {filtro !== 'Todas' && (
                <button
                  className="recepcion-solicitud-boton-secundario"
                  type="button"
                  onClick={() => setFiltro('Todas')}
                >
                  Ver todas las solicitudes
                </button>
              )}
            </div>
          ) : (
            <div className="recepcion-solicitudes-lista">
              {citasFiltradas.map((cita) => (
                <article className="recepcion-solicitud-card" key={cita.id}>
                  <div className="recepcion-solicitud-datos">
                    <header className="recepcion-solicitud-titulo">
                      <div className="recepcion-solicitud-identidad">
                        <span className="recepcion-solicitud-avatar" aria-hidden="true">
                          🐾
                        </span>
                        <div>
                          <span className="recepcion-solicitud-id">
                            Solicitud #{String(cita.id).slice(-8)}
                          </span>
                          <h3>
                            {cita.mascotaNombre || cita.mascota || 'Sin nombre'}
                          </h3>
                          <p>{cita.servicio || 'Servicio no especificado'}</p>
                        </div>
                      </div>

                      <span
                        className={`recepcion-solicitud-estado ${claseEstado(cita.estado)}`}
                      >
                        <span aria-hidden="true">●</span>
                        {cita.estado || 'Pendiente de confirmación'}
                      </span>
                    </header>

                    <div className="recepcion-solicitud-meta">
                      <div>
                        <span className="recepcion-solicitud-meta-icono" aria-hidden="true">
                          ▦
                        </span>
                        <span>
                          <small>Fecha solicitada</small>
                          <strong>{formatearFecha(cita.fecha)}</strong>
                        </span>
                      </div>
                      <div>
                        <span className="recepcion-solicitud-meta-icono" aria-hidden="true">
                          ◷
                        </span>
                        <span>
                          <small>Horario</small>
                          <strong>{cita.hora || 'Sin horario'}</strong>
                        </span>
                      </div>
                    </div>

                    {cita.motivo && (
                      <div className="recepcion-solicitud-motivo">
                        <strong>Motivo de consulta</strong>
                        <p>{cita.motivo}</p>
                      </div>
                    )}

                    <div className="recepcion-solicitud-acciones">
                      <Link
                        className="recepcion-solicitud-boton-secundario"
                        to={`/mis-citas/${cita.id}`}
                      >
                        Ver detalle <span aria-hidden="true">→</span>
                      </Link>

                      {cita.estado !== 'Cancelada' && (
                        <>
                          {cita.estado !== 'Confirmada' && (
                            <button
                              className="recepcion-solicitud-boton confirmar"
                              type="button"
                              onClick={() => confirmarCita(cita.id)}
                            >
                              <span aria-hidden="true">✓</span>
                              Confirmar cita
                            </button>
                          )}

                          <button
                            className="recepcion-solicitud-boton-secundario"
                            type="button"
                            onClick={() => abrirReprogramacion(cita)}
                          >
                            Reprogramar
                          </button>

                          <button
                            className="recepcion-solicitud-boton cancelar"
                            type="button"
                            onClick={() => cancelarCita(cita.id)}
                          >
                            Cancelar cita
                          </button>
                        </>
                      )}
                    </div>

                    {String(citaReprogramar) === String(cita.id) && (
                      <form
                        className="recepcion-reprogramacion"
                        onSubmit={(event) => guardarReprogramacion(event, cita)}
                      >
                        <div className="recepcion-reprogramacion-encabezado">
                          <span aria-hidden="true">📅</span>
                          <div>
                            <h4>Reprogramar cita</h4>
                            <p>
                              Elige una nueva fecha y hora para esta solicitud.
                            </p>
                          </div>
                        </div>

                        <div className="recepcion-reprogramacion-campos">
                          <label>
                            Nueva fecha
                            <input
                              type="date"
                              min={fechaLocal()}
                              value={nuevaFecha}
                              onChange={(event) => setNuevaFecha(event.target.value)}
                              required
                            />
                          </label>

                          <label>
                            Nuevo horario
                            <select
                              value={nuevaHora}
                              onChange={(event) => setNuevaHora(event.target.value)}
                              required
                            >
                              <option value="">Selecciona una hora</option>
                              {horarios.map((horario) => (
                                <option key={horario} value={horario}>
                                  {horario}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="recepcion-solicitud-acciones">
                          <button
                            className="recepcion-solicitud-boton confirmar"
                            type="submit"
                          >
                            Guardar nueva fecha
                          </button>
                          <button
                            className="recepcion-solicitud-boton-secundario"
                            type="button"
                            onClick={cerrarReprogramacion}
                          >
                            Cancelar cambios
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="recepcion-solicitudes-pie">
          <span aria-hidden="true">🐾</span>
          <p>Una agenda organizada nos ayuda a cuidar mejor de cada mascota.</p>
        </footer>
      </div>
    </main>
  )
}

export default RecepcionSolicitudesPage
