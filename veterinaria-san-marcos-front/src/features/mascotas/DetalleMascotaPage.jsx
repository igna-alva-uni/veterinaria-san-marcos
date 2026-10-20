
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  actualizarMascota,
  eliminarMascota,
  obtenerMascotaPorId,
} from '../../data/veterinaria.js'
import './DetalleMascotaPage.css'
import HistorialClinico from '../../components/HistorialClinico.jsx'

const especies = {
  Perro: '🐶',
  Gato: '🐱',
  Conejo: '🐰',
  Ave: '🐦',
  Otro: '🐾',
}

function DetalleMascotaPage({ pacientes = [], usuario }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const mascota = pacientes.find(p => String(p.id) === String(id) && String(p.duenoId) === String(usuario?.id)) || null
  const [editando, setEditando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(() => ({
    nombre: mascota?.nombre ?? '',
    especie: mascota?.especie ?? 'Perro',
    raza: mascota?.raza ?? '',
    edad: mascota?.edad ?? '',
    sexo: mascota?.sexo ?? 'Macho',
  }))

  function manejarCambio(evento) {
    const { name, value } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))
  }

  function guardarCambios(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    const resultado = actualizarMascota(id, formulario)

    if (!resultado.ok) {
      setError(resultado.mensaje || 'No se pudieron guardar los cambios.')
      return
    }

    const mascotaActualizada = obtenerMascotaPorId(id)
    setFormulario({
      nombre: mascotaActualizada.nombre ?? '',
      especie: mascotaActualizada.especie ?? 'Perro',
      raza: mascotaActualizada.raza ?? '',
      edad: mascotaActualizada.edad ?? '',
      sexo: mascotaActualizada.sexo ?? 'Macho',
    })
    setEditando(false)
    setMensaje('Los datos de la mascota se actualizaron correctamente.')
  }

  function cancelarEdicion() {
    setFormulario({
      nombre: mascota.nombre ?? '',
      especie: mascota.especie ?? 'Perro',
      raza: mascota.raza ?? '',
      edad: mascota.edad ?? '',
      sexo: mascota.sexo ?? 'Macho',
    })
    setEditando(false)
    setError('')
  }

  function manejarEliminacion() {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${mascota.nombre}? Esta acción no se puede deshacer.`,
    )

    if (!confirmar) return

    const resultado = eliminarMascota(id)

    if (!resultado.ok) {
      setError(resultado.mensaje || 'No se pudo eliminar la mascota.')
      return
    }

    navigate('/mascotas', {
      state: { mensaje: 'La mascota fue eliminada correctamente.' },
    })
  }

  if (!mascota) {
    return (
      <div className="detalle-mascota-contenedor">
        <section className="detalle-mascota-no-encontrada">
          <h1>Mascota no encontrada</h1>
          <p>La mascota no existe o pudo haber sido eliminada.</p>
          <Link className="detalle-mascota-boton" to="/mascotas">
            Volver al catálogo
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="detalle-mascota-contenedor">
      <Link className="detalle-mascota-volver" to="/mascotas">
        ← Volver a mascotas
      </Link>

      <section className="detalle-mascota-portada">
        <div className="detalle-mascota-icono" aria-hidden="true">
          {especies[mascota.especie] || '🐾'}
        </div>

        <div className="detalle-mascota-presentacion">
          <span className="detalle-mascota-etiqueta">Ficha de mascota</span>
          <h1>{mascota.nombre}</h1>
          <p>
            {mascota.especie}
            {mascota.raza ? ` · ${mascota.raza}` : ''}
          </p>
        </div>
      </section>

      {mensaje && (
        <div className="detalle-mascota-mensaje" role="status">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="detalle-mascota-error" role="alert">
          {error}
        </div>
      )}

      <section className="detalle-mascota-tarjeta">
        <div className="detalle-mascota-encabezado">
          <div>
            <span className="detalle-mascota-etiqueta">Información</span>
            <h2>Datos generales</h2>
          </div>

          {!editando && (
            <button
              type="button"
              className="detalle-mascota-boton"
              onClick={() => {
                setMensaje('')
                setError('')
                setEditando(true)
              }}
            >
              Editar mascota
            </button>
          )}
        </div>

        {editando ? (
          <form
            className="detalle-mascota-formulario"
            onSubmit={guardarCambios}
          >
            <label>
              Nombre *
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                maxLength={60}
                required
              />
            </label>

            <label>
              Especie *
              <select
                name="especie"
                value={formulario.especie}
                onChange={manejarCambio}
                required
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Ave">Ave</option>
                <option value="Otro">Otro</option>
              </select>
            </label>

            <label>
              Raza
              <input
                type="text"
                name="raza"
                value={formulario.raza}
                onChange={manejarCambio}
                maxLength={60}
              />
            </label>

            <label>
              Edad
              <input
                type="text"
                name="edad"
                value={formulario.edad}
                onChange={manejarCambio}
                placeholder="Ej.: 3 años"
                maxLength={30}
              />
            </label>

            <label>
              Sexo *
              <select
                name="sexo"
                value={formulario.sexo}
                onChange={manejarCambio}
                required
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </label>

            <div className="detalle-mascota-botones">
              <button type="submit" className="detalle-mascota-boton">
                Guardar cambios
              </button>

              <button
                type="button"
                className="detalle-mascota-boton-secundario"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="detalle-mascota-datos">
            <article>
              <span>Nombre</span>
              <strong>{mascota.nombre}</strong>
            </article>

            <article>
              <span>Especie</span>
              <strong>{mascota.especie || 'No registrada'}</strong>
            </article>

            <article>
              <span>Raza</span>
              <strong>{mascota.raza || 'No registrada'}</strong>
            </article>

            <article>
              <span>Edad</span>
              <strong>{mascota.edad || 'No registrada'}</strong>
            </article>

            <article>
              <span>Sexo</span>
              <strong>{mascota.sexo || 'No registrado'}</strong>
            </article>
          </div>
        )}
      </section>

      <HistorialClinico mascota={mascota} />

      {!editando && (
        <>
          <section className="detalle-mascota-tarjeta">
            <span className="detalle-mascota-etiqueta">Atención veterinaria</span>
            <h2>¿Necesitas una hora?</h2>
            <p>
              Puedes solicitar una cita veterinaria para esta mascota.
            </p>

            <div className="detalle-mascota-acciones">
              <Link
                className="detalle-mascota-boton"
                to={`/citas/nueva?mascotaId=${mascota.id}`}
              >
                Solicitar cita
              </Link>

              <Link
                className="detalle-mascota-boton-secundario"
                to="/mis-citas"
              >
                Ver mis citas
              </Link>
            </div>
          </section>

          <section className="detalle-mascota-zona-peligro">
            <div>
              <h2>Eliminar mascota</h2>
              <p>
                Esta acción quitará la mascota del catálogo. El historial de
                citas existentes se conservará.
              </p>
            </div>

            <button
              type="button"
              className="detalle-mascota-boton-eliminar"
              onClick={manejarEliminacion}
            >
              Eliminar mascota
            </button>
          </section>
        </>
      )}

      <p className="detalle-mascota-nota">
        Los cambios se guardan en el almacenamiento local de este navegador.
      </p>
    </div>
  )
}

export default DetalleMascotaPage
