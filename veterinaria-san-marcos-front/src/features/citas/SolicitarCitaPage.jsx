import { serviciosCatalogo } from '../../data/catalogo.js'

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  obtenerMascotas,
  registrarCita,
} from '../../data/veterinaria.js'
import './SolicitarCitaPage.css'

const servicios = serviciosCatalogo.map(servicio => servicio.nombre)

const horarios = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '15:00',
  '16:00',
  '17:00',
]

function obtenerFechaLocal() {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function SolicitarCitaPage() {
  const [parametros] = useSearchParams()
  const [mascotas] = useState(() => obtenerMascotas())
  const [mascotaId, setMascotaId] = useState(
    () => parametros.get('mascotaId') || '',
  )
  const [servicio, setServicio] = useState(
    () => serviciosCatalogo.find(s => s.codigo === parametros.get('servicio'))?.nombre || '',
  )
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [motivo, setMotivo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('exito')

  const fechaMinima = obtenerFechaLocal()

  function solicitarCita(event) {
    event.preventDefault()
    setMensaje('')

    if (!mascotaId || !servicio || !fecha || !hora) {
      setMensaje('Completa todos los campos obligatorios.')
      setTipoMensaje('error')
      return
    }

    if (fecha < fechaMinima) {
      setMensaje('Selecciona una fecha igual o posterior a hoy.')
      setTipoMensaje('error')
      return
    }

    const resultado = registrarCita({
      mascotaId,
      servicio,
      fecha,
      hora,
      motivo,
      precio: serviciosCatalogo.find(s => s.nombre === servicio)?.precio,
    })

    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      setTipoMensaje('error')
      return
    }

    setMensaje(
      '¡Solicitud registrada! Puedes consultar su estado en Mis citas.',
    )
    setTipoMensaje('exito')
    setMascotaId('')
    setServicio('')
    setFecha('')
    setHora('')
    setMotivo('')
  }

  return (
    <div className="citas-page">
      <div className="citas-contenido">
        <Link className="citas-volver" to="/mascotas">
          <span aria-hidden="true">←</span> Volver a mis mascotas
        </Link>

        <section className="citas-portada">
          <div className="citas-portada-texto">
            <span className="citas-marca">SAN MARCOS · CENTRO VETERINARIO</span>
            <h1 className="citas-titulo">Cuidamos de tu mejor amigo</h1>
            <p className="citas-descripcion">
              Agenda una atención veterinaria de manera sencilla.
              Elige tu mascota, el servicio y el horario que más te acomode.
            </p>
            <div className="citas-beneficios">
              <span><span aria-hidden="true">✓</span> Solicitud sencilla</span>
              <span><span aria-hidden="true">♡</span> Atención para tu mascota</span>
            </div>
          </div>

          <div className="citas-portada-ilustracion" aria-hidden="true">
            <span>🐶</span>
            <span>🐱</span>
            <span className="citas-portada-huella">🐾</span>
          </div>
        </section>

        <div className="citas-layout">
          <section className="citas-panel">
            <div className="citas-panel-encabezado">
              <span className="citas-paso">PASO 1 · DATOS DE ATENCIÓN</span>
              <h2>Solicitar una cita</h2>
              <p>Completa los campos para registrar tu solicitud.</p>
              <p className="citas-obligatorios">Los campos marcados con * son obligatorios.</p>
            </div>

            {mascotas.length === 0 ? (
              <div className="citas-sin-mascotas" role="status">
                <span aria-hidden="true">🐾</span>
                <h3>Primero registra una mascota</h3>
                <p>Necesitas tener una mascota registrada para solicitar una cita veterinaria.</p>
                <Link className="citas-boton" to="/mascotas">
                  Ir a mis mascotas
                </Link>
              </div>
            ) : (
              <form className="citas-card" onSubmit={solicitarCita}>
                <div className="citas-campo">
                  <label htmlFor="mascota" className="citas-label">
                    <span aria-hidden="true">🐾</span> Mascota *
                  </label>
                  <select
                    id="mascota"
                    className="citas-select"
                    value={mascotaId}
                    onChange={(event) => setMascotaId(event.target.value)}
                    required
                  >
                    <option value="">Selecciona una mascota</option>
                    {mascotas.map((mascota) => (
                      <option key={mascota.id} value={mascota.id}>
                        {mascota.nombre} ({mascota.especie})
                      </option>
                    ))}
                  </select>
                  <small className="citas-ayuda">
                    Elige a la mascota que recibirá la atención.
                  </small>
                </div>

                <div className="citas-campo">
                  <label htmlFor="servicio" className="citas-label">
                    <span aria-hidden="true">✚</span> Servicio veterinario *
                  </label>
                  <select
                    id="servicio"
                    className="citas-select"
                    value={servicio}
                    onChange={(event) => setServicio(event.target.value)}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map((nombre) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="citas-fila">
                  <div className="citas-campo">
                    <label htmlFor="fecha" className="citas-label">
                      <span aria-hidden="true">▦</span> Fecha *
                    </label>
                    <input
                      id="fecha"
                      type="date"
                      className="citas-input"
                      min={fechaMinima}
                      value={fecha}
                      onChange={(event) => setFecha(event.target.value)}
                      required
                    />
                  </div>

                  <div className="citas-campo">
                    <label htmlFor="hora" className="citas-label">
                      <span aria-hidden="true">◷</span> Horario *
                    </label>
                    <select
                      id="hora"
                      className="citas-select"
                      value={hora}
                      onChange={(event) => setHora(event.target.value)}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {horarios.map((horario) => (
                        <option key={horario} value={horario}>
                          {horario}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="citas-campo">
                  <label htmlFor="motivo" className="citas-label">
                    <span aria-hidden="true">▤</span> Motivo de consulta
                    <span className="citas-opcional">(opcional)</span>
                  </label>
                  <textarea
                    id="motivo"
                    className="citas-textarea"
                    rows={4}
                    maxLength={300}
                    placeholder="Cuéntanos brevemente qué necesita tu mascota..."
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                  />
                  <small className="citas-ayuda">
                    Máximo 300 caracteres.
                  </small>
                </div>

                <button type="submit" className="citas-boton">
                  Solicitar cita <span aria-hidden="true">→</span>
                </button>

                {mensaje && (
                  <div
                    className={`citas-mensaje ${tipoMensaje === 'error' ? 'citas-mensaje-error' : 'citas-mensaje-exito'}`}
                    role="status"
                    aria-live="polite"
                  >
                    <span aria-hidden="true">
                      {tipoMensaje === 'error' ? '!' : '✓'}
                    </span>
                    {mensaje}
                  </div>
                )}
              </form>
            )}
          </section>

          <aside className="citas-lateral">
            <div className="citas-lateral-tarjeta">
              <span className="citas-lateral-icono" aria-hidden="true">💙</span>
              <h3>Su bienestar es lo primero</h3>
              <p>
                Entrega los datos con atención para ayudarnos a organizar
                mejor la visita de tu compañero.
              </p>
            </div>

            <div className="citas-lateral-tarjeta citas-lateral-horarios">
              <span className="citas-lateral-icono" aria-hidden="true">🕒</span>
              <h3>Horarios disponibles</h3>
              <p>Selecciona una de las horas ofrecidas en el formulario.</p>
              <div className="citas-horarios-resumen">
                {horarios.map((horario) => (
                  <span key={horario}>{horario}</span>
                ))}
              </div>
              <small>La solicitud queda pendiente de confirmación.</small>
            </div>

            <div className="citas-lateral-ayuda">
              <span aria-hidden="true">ℹ</span>
              <p>
                Después de enviar tu solicitud, puedes revisar su estado
                desde la sección Mis citas.
              </p>
              <Link to="/mis-citas">Consultar mis citas →</Link>
            </div>
          </aside>
        </div>

        <footer className="citas-pie">
          <span aria-hidden="true">🐾</span>
          Cada mascota es parte de la familia.
        </footer>
      </div>
    </div>
  )
}

export default SolicitarCitaPage
