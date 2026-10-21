import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerMascotas, registrarMascota } from '../../data/veterinaria.js'
import perroReal from '../../assets/perro-real.png'
import './MascotasPage.css'

function MascotasPage() {
  const [mascotas, setMascotas] = useState(() => obtenerMascotas())
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [especie, setEspecie] = useState('Perro')
  const [raza, setRaza] = useState('')
  const [edad, setEdad] = useState('')
  const [sexo, setSexo] = useState('No especificado')
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('exito')

  const mascotasFiltradas = mascotas.filter((mascota) =>
    `${mascota.nombre} ${mascota.especie} ${mascota.raza}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  )

  function registrarNuevaMascota(event) {
    event.preventDefault()

    const resultado = registrarMascota({
      nombre,
      especie,
      raza,
      edad,
      sexo,
    })

    if (!resultado.ok) {
      setMensaje(resultado.mensaje)
      setTipoMensaje('error')
      return
    }

    setMascotas(obtenerMascotas())
    setNombre('')
    setEspecie('Perro')
    setRaza('')
    setEdad('')
    setSexo('No especificado')
    setMostrarFormulario(false)
    setMensaje('Mascota registrada correctamente.')
    setTipoMensaje('exito')
  }

  return (
    <div className="mascotas-page">
      <div className="mascotas-contenido">
        <section className="mascotas-banner">
          <div className="mascotas-banner-texto">
            <span className="mascotas-etiqueta">
              SAN MARCOS · CENTRO VETERINARIO
            </span>

            <h1>Mis mascotas</h1>

            <p>
              Cada mascota es parte de la familia. Organiza sus datos y accede
              fácilmente a su ficha.
            </p>
          </div>

          <div className="mascotas-banner-ilustracion">
            <img
              className="mascotas-banner-imagen"
              src={perroReal}
              alt="Un perro y un gato"
            />
            <span className="mascotas-banner-huella" aria-hidden="true">
              🐾
            </span>
          </div>
        </section>

        <div className="mascotas-encabezado">
          <div>
            <h2>Tu familia animal</h2>
            <p>Administra las mascotas que tienes registradas.</p>
          </div>

          <button
            className="mascotas-boton-principal"
            type="button"
            onClick={() => {
              setMostrarFormulario((actual) => !actual)
              setMensaje('')
            }}
          >
            {mostrarFormulario ? 'Cancelar' : '+ Registrar mascota'}
          </button>
        </div>

        {mensaje && (
          <div
            className={`mascotas-mensaje ${
              tipoMensaje === 'error' ? 'mascotas-mensaje-error' : ''
            }`}
            role="status"
          >
            {mensaje}
          </div>
        )}

        <section className="mascotas-resumen" aria-label="Resumen de mascotas">
          <article className="mascotas-resumen-card">
            <span className="mascotas-resumen-icono">🐾</span>
            <div>
              <span>Mascotas registradas</span>
              <strong>{mascotas.length}</strong>
            </div>
          </article>

          <article className="mascotas-resumen-card">
            <span className="mascotas-resumen-icono mascotas-icono-perro">
              🐶
            </span>
            <div>
              <span>Perros</span>
              <strong>
                {mascotas.filter((mascota) => mascota.especie === 'Perro').length}
              </strong>
            </div>
          </article>

          <article className="mascotas-resumen-card">
            <span className="mascotas-resumen-icono mascotas-icono-gato">
              🐱
            </span>
            <div>
              <span>Gatos</span>
              <strong>
                {mascotas.filter((mascota) => mascota.especie === 'Gato').length}
              </strong>
            </div>
          </article>
        </section>

        {mostrarFormulario && (
          <section className="mascotas-formulario-panel">
            <div className="mascotas-formulario-titulo">
              <span className="mascotas-etiqueta">NUEVO REGISTRO</span>
              <h2>Registrar una mascota</h2>
              <p>Completa los datos para crear su ficha.</p>
            </div>

            <form onSubmit={registrarNuevaMascota}>
              <div className="mascotas-formulario-campos">
                <div className="mascotas-campo">
                  <label htmlFor="nombre">Nombre de la mascota *</label>
                  <input
                    id="nombre"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Ej. Luna"
                    maxLength={60}
                    required
                  />
                </div>

                <div className="mascotas-campo">
                  <label htmlFor="especie">Especie *</label>
                  <select
                    id="especie"
                    value={especie}
                    onChange={(event) => setEspecie(event.target.value)}
                    required
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="mascotas-campo">
                  <label htmlFor="raza">Raza *</label>
                  <input
                    id="raza"
                    value={raza}
                    onChange={(event) => setRaza(event.target.value)}
                    placeholder="Ej. Mestizo"
                    maxLength={60}
                    required
                  />
                </div>

                <div className="mascotas-campo">
                  <label htmlFor="edad">Edad *</label>
                  <input
                    id="edad"
                    value={edad}
                    onChange={(event) => setEdad(event.target.value)}
                    placeholder="Ej. 2 años"
                    maxLength={30}
                    required
                  />
                </div>

                <div className="mascotas-campo">
                  <label htmlFor="sexo">Sexo</label>
                  <select
                    id="sexo"
                    value={sexo}
                    onChange={(event) => setSexo(event.target.value)}
                  >
                    <option value="No especificado">No especificado</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
              </div>

              <div className="mascotas-formulario-acciones">
                <button
                  className="mascotas-boton-secundario"
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setMensaje('')
                  }}
                >
                  Cancelar
                </button>

                <button className="mascotas-boton-principal" type="submit">
                  Guardar mascota
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mascotas-listado">
          <div className="mascotas-listado-cabecera">
            <div>
              <h2>Mascotas registradas</h2>
              <p>Busca y consulta las fichas de tus mascotas.</p>
            </div>

            <input
              className="mascotas-busqueda"
              type="search"
              placeholder="Buscar mascota..."
              aria-label="Buscar mascota"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          {mascotasFiltradas.length > 0 ? (
            <div className="mascotas-grid">
              {mascotasFiltradas.map((mascota) => (
                <article className="mascota-card" key={mascota.id}>
                  <div className="mascota-card-cabecera">
                    <span className="mascota-avatar" aria-hidden="true">
                      {mascota.especie === 'Gato'
                        ? '🐱'
                        : mascota.especie === 'Perro'
                          ? '🐶'
                          : '🐾'}
                    </span>

                    <span className="mascota-especie">{mascota.especie}</span>
                  </div>

                  <div className="mascota-card-contenido">
                    <h3>{mascota.nombre}</h3>
                    <p className="mascota-raza">{mascota.raza}</p>

                    <div className="mascota-datos">
                      <div>
                        <span>Edad</span>
                        <strong>{mascota.edad || 'No registrada'}</strong>
                      </div>

                      <div>
                        <span>Sexo</span>
                        <strong>{mascota.sexo || 'No especificado'}</strong>
                      </div>
                    </div>

                    <Link
                      className="mascota-ver-detalle"
                      to={`/mascotas/${mascota.id}`}
                    >
                      Ver ficha de mascota <span>→</span>
                    </Link>

                    <Link
                      className="mascota-solicitar-cita"
                      to={`/citas/nueva?mascotaId=${encodeURIComponent(mascota.id)}`}
                    >
                      Solicitar cita
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mascotas-vacio">
              <span aria-hidden="true">🐾</span>
              <h3>No encontramos mascotas</h3>
              <p>
                Prueba con otro término de búsqueda o registra una nueva
                mascota.
              </p>

              {busqueda && (
                <button
                  type="button"
                  className="mascotas-boton-secundario"
                  onClick={() => setBusqueda('')}
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default MascotasPage