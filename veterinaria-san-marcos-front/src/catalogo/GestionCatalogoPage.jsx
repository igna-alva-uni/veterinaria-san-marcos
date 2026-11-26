import { useState } from 'react'
import {
  actualizarProducto,
  actualizarServicio,
  crearProducto,
  crearServicio,
  eliminarProducto,
  eliminarServicio,
  useCatalogo,
} from '../api/catalogo.js'

const formatoPrecio = (precio) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(Number(precio) || 0)

const PRODUCTO_VACIO = { codigo: '', nombre: '', categoria: '', principioActivo: '', presentacion: '', especie: 'Perro / Gato', stock: 0, precio: 0, activo: true }
const SERVICIO_VACIO = { codigo: '', nombre: '', categoria: '', especie: 'Perro / Gato', duracionMinutos: 30, precio: 0, observaciones: '', activo: true }

/** Validaciones de la vista; el backend vuelve a validar con Bean Validation. */
function validar(tipo, d) {
  const patron = tipo === 'producto' ? /^ME\d{3,8}$/ : /^SV\d{3,8}$/
  if (!patron.test(String(d.codigo).trim().toUpperCase())) return `El código debe tener el formato ${tipo === 'producto' ? 'ME001' : 'SV001'}.`
  if (!String(d.nombre).trim()) return 'Ingresa el nombre.'
  if (!String(d.categoria).trim()) return 'Ingresa la categoría.'
  if (!Number.isInteger(Number(d.precio)) || Number(d.precio) < 0) return 'El precio debe ser un entero mayor o igual a 0.'
  if (tipo === 'producto' && (!Number.isInteger(Number(d.stock)) || Number(d.stock) < 0)) return 'El stock debe ser un entero mayor o igual a 0.'
  if (tipo === 'servicio' && (!Number.isInteger(Number(d.duracionMinutos)) || Number(d.duracionMinutos) <= 0)) return 'La duración debe ser mayor a 0 minutos.'
  return ''
}

// CRUD del catálogo de la tienda (solo Administrador; el backend lo exige con @PreAuthorize).
export default function GestionCatalogoPage() {
  const { productos, servicios, cargando, error, recargar } = useCatalogo({ incluirInactivos: true })
  const [tipo, setTipo] = useState('producto')
  const [formulario, setFormulario] = useState(null)
  const [editandoCodigo, setEditandoCodigo] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const lista = (tipo === 'producto' ? productos : servicios)
    .filter((e) => `${e.codigo} ${e.nombre} ${e.categoria}`.toLowerCase().includes(busqueda.toLowerCase()))

  const cambiar = (campo, valor) => setFormulario((actual) => ({ ...actual, [campo]: valor }))

  function abrirNuevo() {
    setEditandoCodigo(null)
    setFormulario(tipo === 'producto' ? { ...PRODUCTO_VACIO } : { ...SERVICIO_VACIO })
    setMensaje('')
  }

  function abrirEdicion(elemento) {
    setEditandoCodigo(elemento.codigo)
    setFormulario({ ...elemento })
    setMensaje('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    const fallo = validar(tipo, formulario)
    if (fallo) {
      setMensaje(fallo)
      return
    }
    setGuardando(true)
    try {
      if (tipo === 'producto') {
        if (editandoCodigo) await actualizarProducto(editandoCodigo, formulario)
        else await crearProducto(formulario)
      } else if (editandoCodigo) {
        await actualizarServicio(editandoCodigo, formulario)
      } else {
        await crearServicio(formulario)
      }
      setMensaje(editandoCodigo ? 'Cambios guardados correctamente.' : 'Elemento creado correctamente.')
      setFormulario(null)
      setEditandoCodigo(null)
      await recargar()
    } catch (fallo) {
      setMensaje(fallo.message)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(elemento) {
    if (!window.confirm(`¿Eliminar ${elemento.nombre} (${elemento.codigo})?`)) return
    try {
      const resultado = tipo === 'producto' ? await eliminarProducto(elemento.codigo) : await eliminarServicio(elemento.codigo)
      setMensaje(resultado)
      await recargar()
    } catch (fallo) {
      setMensaje(fallo.message)
    }
  }

  return (
    <section className="tarjeta">
      <h1>Catálogo de la tienda</h1>
      <p>Administra los productos y servicios que se muestran en el catálogo y el carrito.</p>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}

      <div role="tablist" aria-label="Tipo de elemento">
        {[['producto', `Productos (${productos.length})`], ['servicio', `Servicios (${servicios.length})`]].map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={tipo === valor}
            onClick={() => { setTipo(valor); setFormulario(null); setEditandoCodigo(null); setMensaje('') }}
          >
            {etiqueta}
          </button>
        ))}
        <button type="button" onClick={abrirNuevo}>
          {tipo === 'producto' ? 'Nuevo producto' : 'Nuevo servicio'}
        </button>
      </div>

      {formulario && (
        <form className="tarjeta formulario" onSubmit={guardar} aria-label={editandoCodigo ? 'Editar elemento' : 'Nuevo elemento'}>
          <h2>{editandoCodigo ? `Editar ${editandoCodigo}` : tipo === 'producto' ? 'Nuevo producto' : 'Nuevo servicio'}</h2>
          <label>Código
            <input required disabled={Boolean(editandoCodigo)} value={formulario.codigo}
              placeholder={tipo === 'producto' ? 'ME023' : 'SV032'} onChange={(e) => cambiar('codigo', e.target.value)} />
          </label>
          <label>Nombre<input required value={formulario.nombre} onChange={(e) => cambiar('nombre', e.target.value)} /></label>
          <label>Categoría<input required value={formulario.categoria} onChange={(e) => cambiar('categoria', e.target.value)} /></label>
          <label>Especie
            <select value={formulario.especie} onChange={(e) => cambiar('especie', e.target.value)}>
              {['Perro / Gato', 'Perro', 'Gato', 'TODAS'].map((especie) => <option key={especie}>{especie}</option>)}
            </select>
          </label>
          {tipo === 'producto' ? (
            <>
              <label>Principio activo<input value={formulario.principioActivo ?? ''} onChange={(e) => cambiar('principioActivo', e.target.value)} /></label>
              <label>Presentación<input value={formulario.presentacion ?? ''} onChange={(e) => cambiar('presentacion', e.target.value)} /></label>
              <label>Stock<input type="number" min="0" required value={formulario.stock} onChange={(e) => cambiar('stock', e.target.value)} /></label>
            </>
          ) : (
            <>
              <label>Duración (minutos)<input type="number" min="1" required value={formulario.duracionMinutos} onChange={(e) => cambiar('duracionMinutos', e.target.value)} /></label>
              <label>Observaciones<input value={formulario.observaciones ?? ''} onChange={(e) => cambiar('observaciones', e.target.value)} /></label>
            </>
          )}
          <label>Precio (CLP)<input type="number" min="0" required value={formulario.precio} onChange={(e) => cambiar('precio', e.target.value)} /></label>
          <label>
            <input type="checkbox" checked={Boolean(formulario.activo)} onChange={(e) => cambiar('activo', e.target.checked)} />
            {' '}Visible en el catálogo
          </label>
          <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" onClick={() => { setFormulario(null); setEditandoCodigo(null) }}>Cancelar</button>
        </form>
      )}

      <input placeholder="Buscar por código, nombre o categoría" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      {cargando ? <p role="status">Cargando catálogo...</p> : (
        <div className="tabla-contenedor">
          <div className="tabla overflow-x-auto" role="region" aria-label="Tabla del catálogo" tabIndex={0}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th>Código</th><th>Nombre</th><th>Categoría</th>
                  <th>{tipo === 'producto' ? 'Stock' : 'Duración'}</th>
                  <th>Precio</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((elemento) => (
                  <tr key={elemento.codigo}>
                    <td>{elemento.codigo}</td>
                    <td>{elemento.nombre}</td>
                    <td>{elemento.categoria}</td>
                    <td>{tipo === 'producto' ? elemento.stock : elemento.duracion}</td>
                    <td>{formatoPrecio(elemento.precio)}</td>
                    <td>{elemento.activo ? 'Activo' : 'Inactivo'}</td>
                    <td>
                      <button type="button" onClick={() => abrirEdicion(elemento)}>Editar</button>
                      <button type="button" className="boton-eliminar" onClick={() => eliminar(elemento)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
