
import { useState } from 'react'

const mascotasIniciales = [
  {
    id: 1,
    nombre: 'Luna',
    especie: 'Perro',
    raza: 'Labrador',
    edad: '3 años',
    sexo: 'Hembra',
  },
  {
    id: 2,
    nombre: 'Michi',
    especie: 'Gato',
    raza: 'Mestizo',
    edad: '2 años',
    sexo: 'Macho',
  },
]

function MascotasPage() {
  const [mascotas, setMascotas] = useState(mascotasIniciales)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [especie, setEspecie] = useState('Perro')

  const mascotasFiltradas = mascotas.filter((mascota) =>
    mascota.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  function registrarMascota(event) {
    event.preventDefault()

    if (!nombre.trim()) return

    const nuevaMascota = {
      id: Date.now(),
      nombre: nombre.trim(),
      especie,
      raza: 'No registrada',
      edad: 'No registrada',
      sexo: 'No especificado',
    }

    setMascotas((anteriores) => [...anteriores, nuevaMascota])
    setNombre('')
    setEspecie('Perro')
    setMostrarFormulario(false)
  }

  return (
    <main className="container py-4">
      <h1 className="mb-2">Mis mascotas</h1>
      <p className="text-secondary">
        Administra las mascotas registradas en tu cuenta.
      </p>

      <button
        className="btn btn-primary mb-3"
        type="button"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
      >
        {mostrarFormulario ? 'Cancelar' : '+ Registrar mascota'}
      </button>

      {mostrarFormulario && (
        <form className="card card-body mb-4" onSubmit={registrarMascota}>
          <label className="form-label" htmlFor="nombre">
            Nombre de la mascota
          </label>
          <input
            id="nombre"
            className="form-control mb-3"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />

          <label className="form-label" htmlFor="especie">
            Especie
          </label>
          <select
            id="especie"
            className="form-select mb-3"
            value={especie}
            onChange={(event) => setEspecie(event.target.value)}
          >
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>

          <button className="btn btn-success" type="submit">
            Guardar mascota
          </button>
        </form>
      )}

      <label className="form-label" htmlFor="buscar">
        Buscar mascota
      </label>
      <input
        id="buscar"
        className="form-control mb-4"
        placeholder="Escribe un nombre..."
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
      />

      <div className="row g-3">
        {mascotasFiltradas.map((mascota) => (
          <div className="col-12 col-md-6 col-lg-4" key={mascota.id}>
            <article className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="h5">{mascota.nombre}</h2>
                <p className="mb-1">
                  <strong>Especie:</strong> {mascota.especie}
                </p>
                <p className="mb-1">
                  <strong>Raza:</strong> {mascota.raza}
                </p>
                <p className="mb-1">
                  <strong>Edad:</strong> {mascota.edad}
                </p>
                <p className="mb-0">
                  <strong>Sexo:</strong> {mascota.sexo}
                </p>
              </div>
            </article>
          </div>
        ))}
      </div>

      {mascotasFiltradas.length === 0 && (
        <p className="text-secondary mt-3">
          No se encontraron mascotas.
        </p>
      )}
    </main>
  )
}

export default MascotasPage
