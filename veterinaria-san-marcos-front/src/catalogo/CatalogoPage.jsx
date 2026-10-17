
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  categoriasProductos,
  productosCatalogo,
} from '../data/catalogo.js'
import './CatalogoPage.css'

const ICONOS_CATEGORIA = {
  Antibióticos: '💊',
  Antiparasitarios: '🐾',
  Antiinflamatorios: '🩺',
  Dermatología: '🧴',
  Digestivo: '🌿',
  Cardíaco: '❤️',
  Analgésicos: '🩹',
  Vacunas: '💉',
  Suplementos: '🦴',
  Consultas: '🩺',
  Vacunación: '💉',
  Cirugía: '🏥',
  Desparasitación: '🐾',
  Exámenes: '🔬',
  Otros: '🐶',
}

const CLAVE_CARRITO = 'vsm-carrito'

function leerCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO)
    if (!guardado) return []

    const datos = JSON.parse(guardado)
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

function guardarEnCarrito(elemento) {
  const carrito = leerCarrito()
  const existente = carrito.find(
    (item) => item.codigo === elemento.codigo,
  )

  if (elemento.tipo === 'producto') {
    const cantidadActual = existente?.cantidad ?? 0

    if (cantidadActual >= elemento.stock) {
      return {
        ok: false,
        mensaje: `No puedes agregar más unidades de ${elemento.nombre}. Stock disponible: ${elemento.stock}.`,
      }
    }
  }

  if (existente) {
    existente.cantidad = (existente.cantidad ?? 0) + 1
  } else {
    carrito.push({ ...elemento, cantidad: 1 })
  }

  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito))

    return {
      ok: true,
      mensaje: `${elemento.nombre} se agregó al carrito.`,
    }
  } catch {
    return {
      ok: false,
      mensaje: 'No se pudo guardar el carrito en este navegador.',
    }
  }
}

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio)
}

function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [tipo, setTipo] = useState('todos')
  const [orden, setOrden] = useState('nombre')
  const [aviso, setAviso] = useState(null)
  const temporizadorAviso = useRef(null)

  useEffect(() => {
    return () => {
      if (temporizadorAviso.current) {
        clearTimeout(temporizadorAviso.current)
      }
    }
  }, [])

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return productosCatalogo
      .filter((elemento) => {
        const campos = [
          elemento.codigo,
          elemento.nombre,
          elemento.principioActivo,
          elemento.categoria,
          elemento.especie,
          elemento.presentacion,
          elemento.duracion,
          elemento.observaciones,
        ]

        const coincideBusqueda = campos.some((valor) =>
          String(valor ?? '').toLowerCase().includes(termino),
        )

        const coincideCategoria =
          categoria === 'Todas' || elemento.categoria === categoria

        const coincideTipo =
          tipo === 'todos' || elemento.tipo === tipo

        return coincideBusqueda && coincideCategoria && coincideTipo
      })
      .sort((a, b) => {
        if (orden === 'precio-menor') return a.precio - b.precio
        if (orden === 'precio-mayor') return b.precio - a.precio

        if (orden === 'stock') {
          const stockA = a.tipo === 'producto' ? a.stock : -1
          const stockB = b.tipo === 'producto' ? b.stock : -1
          return stockB - stockA
        }

        return a.nombre.localeCompare(b.nombre, 'es')
      })
  }, [busqueda, categoria, tipo, orden])

  function mostrarAviso(resultado) {
    if (temporizadorAviso.current) {
      clearTimeout(temporizadorAviso.current)
    }

    setAviso({
      ok: resultado.ok,
      mensaje: resultado.mensaje,
    })

    temporizadorAviso.current = setTimeout(() => {
      setAviso(null)
      temporizadorAviso.current = null
    }, 3000)
  }

  function cerrarAviso() {
    if (temporizadorAviso.current) {
      clearTimeout(temporizadorAviso.current)
      temporizadorAviso.current = null
    }

    setAviso(null)
  }

  function manejarAgregar(elemento) {
    const resultado = guardarEnCarrito(elemento)
    mostrarAviso(resultado)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setCategoria('Todas')
    setTipo('todos')
    setOrden('nombre')
  }

  return (
    <main className="catalogo-page">
      {aviso && (
        <div
          className={`catalogo-toast ${
            aviso.ok ? '' : 'catalogo-toast-error'
          }`}
          role={aviso.ok ? 'status' : 'alert'}
          aria-live="polite"
        >
          <span className="catalogo-toast-icono" aria-hidden="true">
            {aviso.ok ? '✓' : '⚠'}
          </span>

          <div className="catalogo-toast-contenido">
            <strong>
              {aviso.ok ? '¡Agregado al carrito!' : 'No se pudo agregar'}
            </strong>
            <span>{aviso.mensaje}</span>
          </div>

          <button
            type="button"
            className="catalogo-toast-cerrar"
            onClick={cerrarAviso}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}

      <section className="catalogo-hero">
        <div className="catalogo-hero-texto">
          <span className="catalogo-etiqueta">
            VETERINARIA SAN MARCOS
          </span>

          <h1>Catálogo veterinario</h1>

          <p>
            Encuentra medicamentos, vacunas y servicios veterinarios.
            Consulta precios, disponibilidad, duración y detalles de
            cada atención.
          </p>

          <div className="catalogo-hero-datos">
            <span>🐾 Productos y servicios veterinarios</span>
            <span>✓ Precios en pesos chilenos</span>
          </div>
        </div>

        <div className="catalogo-hero-ilustracion" aria-hidden="true">
          <span>🐶</span>
          <span>💊</span>
          <span>🐱</span>
        </div>
      </section>

      <section className="catalogo-contenido">
        <header className="catalogo-titulo-seccion">
          <div>
            <span className="catalogo-etiqueta">
              NUESTRO CATÁLOGO
            </span>
            <h2>Productos y servicios</h2>
            <p>
              Busca, filtra y revisa los elementos disponibles.
            </p>
          </div>

          <div className="catalogo-contador">
            <strong>{productosFiltrados.length}</strong>
            <span>
              {productosFiltrados.length === 1
                ? 'elemento encontrado'
                : 'elementos encontrados'}
            </span>
          </div>
        </header>

        <div className="catalogo-filtros">
          <label className="catalogo-busqueda">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, código, especie..."
              aria-label="Buscar en el catálogo"
            />
          </label>

          <label className="catalogo-filtro-select">
            <span>Tipo de elemento</span>
            <select
              value={tipo}
              onChange={(evento) => setTipo(evento.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="producto">Medicamentos y vacunas</option>
              <option value="servicio">Servicios veterinarios</option>
            </select>
          </label>

          <label className="catalogo-filtro-select">
            <span>Categoría</span>
            <select
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              {categoriasProductos.map((nombreCategoria) => (
                <option key={nombreCategoria} value={nombreCategoria}>
                  {nombreCategoria}
                </option>
              ))}
            </select>
          </label>

          <label className="catalogo-filtro-select">
            <span>Ordenar por</span>
            <select
              value={orden}
              onChange={(evento) => setOrden(evento.target.value)}
            >
              <option value="nombre">Nombre: A-Z</option>
              <option value="precio-menor">Precio: menor a mayor</option>
              <option value="precio-mayor">Precio: mayor a menor</option>
              <option value="stock">Mayor disponibilidad</option>
            </select>
          </label>

          <button
            type="button"
            className="catalogo-limpiar"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>

        {productosFiltrados.length > 0 ? (
          <div className="catalogo-grid">
            {productosFiltrados.map((elemento) => (
              <article
                className="catalogo-producto"
                key={elemento.codigo}
              >
                <div className="catalogo-producto-visual">
                  <span className="catalogo-producto-categoria">
                    {elemento.categoria}
                  </span>

                  <span
                    className="catalogo-producto-icono"
                    aria-hidden="true"
                  >
                    {ICONOS_CATEGORIA[elemento.categoria] || '🐾'}
                  </span>

                  <span className="catalogo-producto-codigo">
                    {elemento.codigo}
                  </span>
                </div>

                <div className="catalogo-producto-info">
                  <span className="catalogo-tipo-etiqueta">
                    {elemento.tipo === 'servicio'
                      ? 'Servicio veterinario'
                      : 'Medicamento o vacuna'}
                  </span>

                  <h3>{elemento.nombre}</h3>

                  {elemento.tipo === 'producto' && (
                    <p className="catalogo-producto-principio">
                      {elemento.principioActivo}
                    </p>
                  )}

                  <div className="catalogo-producto-detalles">
                    {elemento.tipo === 'producto' ? (
                      <div>
                        <span>Presentación</span>
                        <strong>{elemento.presentacion}</strong>
                      </div>
                    ) : (
                      <div>
                        <span>Duración aproximada</span>
                        <strong>{elemento.duracion}</strong>
                      </div>
                    )}

                    <div>
                      <span>Especie</span>
                      <strong>{elemento.especie}</strong>
                    </div>
                  </div>

                  {elemento.tipo === 'servicio' &&
                    elemento.observaciones && (
                      <div className="catalogo-observaciones">
                        <span>Observaciones</span>
                        <p>{elemento.observaciones}</p>
                      </div>
                    )}

                  <div className="catalogo-producto-pie">
                    <div className="catalogo-producto-precio">
                      <span>
                        {elemento.tipo === 'servicio'
                          ? 'Precio del servicio'
                          : 'Precio unitario'}
                      </span>
                      <strong>{formatoPrecio(elemento.precio)}</strong>
                    </div>

                    {elemento.tipo === 'producto' && (
                      <span
                        className={`catalogo-stock ${
                          elemento.stock <= 0
                            ? 'catalogo-stock-agotado'
                            : ''
                        }`}
                      >
                        {elemento.stock <= 0
                          ? 'Sin stock'
                          : `Stock: ${elemento.stock}`}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="catalogo-agregar"
                    disabled={
                      elemento.tipo === 'producto' &&
                      elemento.stock <= 0
                    }
                    onClick={() => manejarAgregar(elemento)}
                  >
                    <span aria-hidden="true">＋</span>
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalogo-vacio">
            <span aria-hidden="true">🔎</span>
            <h3>No encontramos resultados</h3>
            <p>
              Prueba con otro término o cambia los filtros seleccionados.
            </p>

            <button
              type="button"
              className="catalogo-agregar"
              onClick={limpiarFiltros}
            >
              Ver catálogo completo
            </button>
          </div>
        )}

        <aside className="catalogo-aviso">
          <span aria-hidden="true">ℹ️</span>
          <p>
            <strong>Importante:</strong> el stock corresponde al catálogo
            de referencia. Los medicamentos y vacunas deben utilizarse
            bajo indicación de un profesional veterinario. Los servicios
            están sujetos a evaluación y confirmación de la clínica.
          </p>
        </aside>
      </section>
    </main>
  )
}

export default CatalogoPage
