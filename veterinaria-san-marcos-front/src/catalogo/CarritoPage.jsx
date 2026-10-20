
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './CarritoPage.css'

const CLAVE_CARRITO = 'vsm-carrito'
const CLAVE_PEDIDOS = 'vsm-pedidos'

function obtenerCarrito() {
  try {
    const datos = localStorage.getItem(CLAVE_CARRITO)
    const productos = datos ? JSON.parse(datos) : []
    return Array.isArray(productos) ? productos : []
  } catch {
    return []
  }
}

function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(precio) || 0)
}

function esServicio(producto) {
  return producto.tipo === 'servicio'
}

function obtenerClaveProducto(producto) {
  return String(producto.codigo ?? producto.id ?? producto.nombre)
}

function iconoProducto(producto) {
  if (esServicio(producto)) return '🩺'

  const categoria = String(producto.categoria ?? '').toLowerCase()
  if (categoria.includes('vacun')) return '💉'
  if (categoria.includes('antibió')) return '💊'
  if (categoria.includes('antiparasit')) return '🐾'
  if (categoria.includes('cirugía')) return '🏥'
  if (categoria.includes('examen')) return '🔬'
  if (categoria.includes('suplement')) return '🦴'

  return '💊'
}

function obtenerPedidos() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_PEDIDOS) || '[]')
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

function CarritoPage() {
  const [productos, setProductos] = useState(obtenerCarrito)
  const [confirmacion, setConfirmacion] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [paso, setPaso] = useState('carrito')
  const [pedidoRealizado, setPedidoRealizado] = useState(null)
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    comuna: '',
    observaciones: '',
  })

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(productos))
    } catch {
      setMensaje('No se pudo guardar el carrito en este navegador.')
    }
  }, [productos])

  const cantidadTotal = useMemo(
    () => productos.reduce(
      (total, producto) => total + (Number(producto.cantidad) || 0),
      0,
    ),
    [productos],
  )

  const cantidadProductos = useMemo(
    () => productos.filter((producto) => !esServicio(producto)).reduce(
      (total, producto) => total + (Number(producto.cantidad) || 0),
      0,
    ),
    [productos],
  )

  const cantidadServicios = useMemo(
    () => productos.filter(esServicio).reduce(
      (total, producto) => total + (Number(producto.cantidad) || 0),
      0,
    ),
    [productos],
  )

  const subtotalProductos = useMemo(
    () => productos.filter((producto) => !esServicio(producto)).reduce(
      (total, producto) =>
        total + (Number(producto.precio) || 0) * (Number(producto.cantidad) || 0),
      0,
    ),
    [productos],
  )

  const subtotalServicios = useMemo(
    () => productos.filter(esServicio).reduce(
      (total, producto) =>
        total + (Number(producto.precio) || 0) * (Number(producto.cantidad) || 0),
      0,
    ),
    [productos],
  )

  const precioTotal = subtotalProductos + subtotalServicios

  function cambiarCantidad(clave, nuevaCantidad) {
    const cantidadSolicitada = Math.max(1, Math.floor(Number(nuevaCantidad) || 1))

    setProductos((actuales) =>
      actuales.map((producto) => {
        if (obtenerClaveProducto(producto) !== clave) return producto
        if (esServicio(producto)) return { ...producto, cantidad: 1 }

        const stock = Number(producto.stock)
        const stockValido = Number.isFinite(stock) && stock >= 1
        const cantidad = stockValido
          ? Math.min(cantidadSolicitada, stock)
          : cantidadSolicitada

        return { ...producto, cantidad }
      }),
    )
  }

  function eliminarProducto(clave) {
    setProductos((actuales) =>
      actuales.filter((producto) => obtenerClaveProducto(producto) !== clave),
    )
    setConfirmacion(null)
    setMensaje('')
  }

  function vaciarCarrito() {
    setProductos([])
    setConfirmacion(null)
    setMensaje('')
  }

  function confirmarAccion() {
    if (!confirmacion) return

    if (confirmacion.tipo === 'todo') {
      vaciarCarrito()
    } else {
      eliminarProducto(confirmacion.clave)
    }
  }

  function actualizarDato(evento) {
    const { name, value } = evento.target
    setDatosCliente((actuales) => ({ ...actuales, [name]: value }))
  }

  function confirmarPedido(evento) {
    evento.preventDefault()
    setMensaje('')

    if (productos.length === 0) {
      setMensaje('Tu carrito está vacío.')
      setPaso('carrito')
      return
    }

    const pedido = {
      numero: `VSM-${Date.now().toString().slice(-8)}`,
      fecha: new Date().toISOString(),
      cliente: { ...datosCliente },
      productos: productos.map((producto) => ({ ...producto })),
      subtotalProductos,
      subtotalServicios,
      total: precioTotal,
      estado: 'Pendiente de confirmación',
    }

    try {
      const pedidos = obtenerPedidos()
      localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify([pedido, ...pedidos]))
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify([]))
      setPedidoRealizado(pedido)
      setProductos([])
      setPaso('completado')
    } catch {
      setMensaje('No se pudo guardar el pedido en este navegador. Revisa el espacio disponible e inténtalo nuevamente.')
    }
  }

  function volverAlCarrito() {
    setPaso('carrito')
    setMensaje('')
  }

  if (paso === 'completado' && pedidoRealizado) {
    return (
      <main className="carrito-pagina">
        <section className="carrito-vacio">
          <div className="carrito-vacio-icono">✅</div>
          <h2>¡Pedido registrado!</h2>
          <p>
            Gracias, {pedidoRealizado.cliente.nombre}. Tu pedido quedó guardado
            en este navegador y está pendiente de confirmación por la clínica.
          </p>
          <p style={{ marginTop: 18 }}>
            <strong>Número de pedido: {pedidoRealizado.numero}</strong>
          </p>
          <p style={{ marginTop: 10 }}>
            Total referencial: <strong>{formatoPrecio(pedidoRealizado.total)}</strong>
          </p>
          <p style={{ marginTop: 10 }}>
            No se ha realizado ningún cobro ni se ha coordinado un despacho.
          </p>
          <Link to="/catalogo" className="carrito-boton-principal">
            Volver al catálogo
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="carrito-pagina">
      <section className="carrito-encabezado">
        <div>
          <span className="carrito-etiqueta">SAN MARCOS · TIENDA</span>
          <h1>{paso === 'datos' ? 'Datos del cliente' : 'Mi carrito'}</h1>
          <p>
            {paso === 'datos'
              ? 'Completa tus datos para registrar el pedido.'
              : 'Revisa los productos y servicios seleccionados para tus mascotas.'}
          </p>
        </div>
        <Link to="/catalogo" className="carrito-volver">
          ← Seguir comprando
        </Link>
      </section>

      {mensaje && (
        <div className="carrito-mensaje" role="alert">
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje('')} aria-label="Cerrar mensaje">
            ×
          </button>
        </div>
      )}

      {confirmacion && (
        <div
          className="carrito-modal-fondo"
          onClick={(evento) => {
            if (evento.target === evento.currentTarget) setConfirmacion(null)
          }}
        >
          <section
            className="carrito-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="carrito-modal-titulo"
            aria-describedby="carrito-modal-descripcion"
          >
            <div className="carrito-modal-icono">⚠️</div>
            <h2 id="carrito-modal-titulo">
              {confirmacion.tipo === 'todo' ? '¿Vaciar el carrito?' : '¿Eliminar este elemento?'}
            </h2>
            <p id="carrito-modal-descripcion">
              {confirmacion.tipo === 'todo'
                ? 'Se eliminarán todos los productos y servicios seleccionados.'
                : `Se eliminará "${confirmacion.nombre}" del carrito.`}
            </p>
            <div className="carrito-modal-acciones">
              <button
                type="button"
                className="carrito-modal-cancelar"
                onClick={() => setConfirmacion(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="carrito-modal-confirmar"
                onClick={confirmarAccion}
              >
                {confirmacion.tipo === 'todo' ? 'Sí, vaciar' : 'Sí, eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}

      {paso === 'datos' ? (
        <div className="carrito-contenido">
          <section className="carrito-listado">
            <div className="carrito-listado-titulo">
              <div>
                <h2>Información para el pedido</h2>
                <p>Los campos marcados son obligatorios.</p>
              </div>
            </div>

            <form onSubmit={confirmarPedido}>
              <div style={{ display: 'grid', gap: 16 }}>
                <label>
                  Nombre completo *
                  <input
                    name="nombre"
                    value={datosCliente.nombre}
                    onChange={actualizarDato}
                    required
                    minLength={3}
                    autoComplete="name"
                    placeholder="Ej. María González"
                    style={estiloCampo}
                  />
                </label>

                <label>
                  Correo electrónico *
                  <input
                    name="correo"
                    type="email"
                    value={datosCliente.correo}
                    onChange={actualizarDato}
                    required
                    autoComplete="email"
                    placeholder="correo@ejemplo.cl"
                    style={estiloCampo}
                  />
                </label>

                <label>
                  Teléfono *
                  <input
                    name="telefono"
                    type="tel"
                    value={datosCliente.telefono}
                    onChange={actualizarDato}
                    required
                    minLength={8}
                    autoComplete="tel"
                    placeholder="+56 9 1234 5678"
                    style={estiloCampo}
                  />
                </label>

                <label>
                  Dirección *
                  <input
                    name="direccion"
                    value={datosCliente.direccion}
                    onChange={actualizarDato}
                    required
                    autoComplete="street-address"
                    placeholder="Calle y número"
                    style={estiloCampo}
                  />
                </label>

                <label>
                  Comuna *
                  <input
                    name="comuna"
                    value={datosCliente.comuna}
                    onChange={actualizarDato}
                    required
                    autoComplete="address-level2"
                    placeholder="Ej. Santiago"
                    style={estiloCampo}
                  />
                </label>

                <label>
                  Observaciones (opcional)
                  <textarea
                    name="observaciones"
                    value={datosCliente.observaciones}
                    onChange={actualizarDato}
                    rows={3}
                    placeholder="Indicaciones para la clínica"
                    style={{ ...estiloCampo, resize: 'vertical' }}
                  />
                </label>
              </div>

              <div className="carrito-resumen-total">
                <span>Total referencial del pedido</span>
                <strong>{formatoPrecio(precioTotal)}</strong>
              </div>

              <p className="carrito-nota">
                Este formulario registra una solicitud de pedido. No procesa pagos
                ni confirma disponibilidad o despacho.
              </p>

              <button type="submit" className="carrito-boton-principal">
                Confirmar pedido
              </button>
              <button
                type="button"
                className="carrito-seguir-resumen"
                onClick={volverAlCarrito}
                style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer' }}
              >
                Volver al carrito
              </button>
            </form>
          </section>

          <aside className="carrito-resumen">
            <h2>Resumen de compra</h2>
            <div className="carrito-resumen-fila">
              <span>Unidades de productos</span><strong>{cantidadProductos}</strong>
            </div>
            <div className="carrito-resumen-fila">
              <span>Servicios seleccionados</span><strong>{cantidadServicios}</strong>
            </div>
            <div className="carrito-resumen-fila">
              <span>Subtotal productos</span><strong>{formatoPrecio(subtotalProductos)}</strong>
            </div>
            <div className="carrito-resumen-fila">
              <span>Subtotal servicios</span><strong>{formatoPrecio(subtotalServicios)}</strong>
            </div>
            <div className="carrito-resumen-fila">
              <span>Despacho</span><strong>Por confirmar</strong>
            </div>
            <div className="carrito-resumen-total">
              <span>Total referencial</span><strong>{formatoPrecio(precioTotal)}</strong>
            </div>
          </aside>
        </div>
      ) : (
        productos.length === 0 ? (
          <section className="carrito-vacio">
            <div className="carrito-vacio-icono">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>
              Todavía no has agregado productos ni servicios. Explora el catálogo
              para encontrar lo que necesita tu mascota.
            </p>
            <Link to="/catalogo" className="carrito-boton-principal">
              Explorar catálogo
            </Link>
          </section>
        ) : (
          <div className="carrito-contenido">
            <section className="carrito-listado">
              <div className="carrito-listado-titulo">
                <div>
                  <h2>Elementos seleccionados</h2>
                  <p>
                    {cantidadTotal} {cantidadTotal === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
                  </p>
                </div>
                <button
                  type="button"
                  className="carrito-vaciar"
                  onClick={() => setConfirmacion({ tipo: 'todo' })}
                >
                  Vaciar carrito
                </button>
              </div>

              {productos.map((producto) => {
                const clave = obtenerClaveProducto(producto)
                const servicio = esServicio(producto)
                const cantidad = Math.max(1, Number(producto.cantidad) || 1)
                const stock = Number(producto.stock)
                const tieneStockValido = Number.isFinite(stock) && stock >= 1

                return (
                  <article className="carrito-producto" key={clave}>
                    <div
                      className={`carrito-producto-icono ${
                        servicio
                          ? 'carrito-producto-icono-servicio'
                          : 'carrito-producto-icono-producto'
                      }`}
                      aria-hidden="true"
                    >
                      {iconoProducto(producto)}
                    </div>

                    <div className="carrito-producto-info">
                      <span className="carrito-producto-codigo">
                        {producto.codigo ?? producto.id ?? 'Elemento'}
                      </span>
                      <span
                        className={`carrito-tipo-etiqueta ${
                          servicio ? 'carrito-tipo-servicio' : 'carrito-tipo-producto'
                        }`}
                      >
                        {servicio ? 'Servicio veterinario' : 'Medicamento o vacuna'}
                      </span>
                      <h3>{producto.nombre}</h3>
                      <p>{producto.categoria}</p>

                      {servicio && producto.duracion && (
                        <span className="carrito-duracion">
                          Duración aproximada: {producto.duracion}
                        </span>
                      )}

                      {!servicio && producto.presentacion && (
                        <span className="carrito-duracion">
                          Presentación: {producto.presentacion}
                        </span>
                      )}

                      <span className="carrito-precio-unitario">
                        {formatoPrecio(producto.precio)}{servicio ? ' por servicio' : ' por unidad'}
                      </span>
                    </div>

                    <div className="carrito-producto-controles">
                      {servicio ? (
                        <>
                          <span className="carrito-control-titulo">Cantidad</span>
                          <span className="carrito-servicio-cantidad">1 servicio</span>
                        </>
                      ) : (
                        <>
                          <label htmlFor={`cantidad-${clave}`}>Cantidad</label>
                          <div className="carrito-control-cantidad">
                            <button
                              type="button"
                              aria-label={`Disminuir cantidad de ${producto.nombre}`}
                              disabled={cantidad <= 1}
                              onClick={() => cambiarCantidad(clave, cantidad - 1)}
                            >
                              −
                            </button>
                            <input
                              id={`cantidad-${clave}`}
                              type="number"
                              min="1"
                              max={tieneStockValido ? stock : undefined}
                              value={cantidad}
                              onChange={(evento) => cambiarCantidad(clave, evento.target.value)}
                            />
                            <button
                              type="button"
                              aria-label={`Aumentar cantidad de ${producto.nombre}`}
                              disabled={tieneStockValido && cantidad >= stock}
                              onClick={() => cambiarCantidad(clave, cantidad + 1)}
                            >
                              +
                            </button>
                          </div>
                          {tieneStockValido && (
                            <span className="carrito-stock-disponible">Stock: {stock}</span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="carrito-producto-subtotal">
                      <span>Subtotal</span>
                      <strong>
                        {formatoPrecio((Number(producto.precio) || 0) * cantidad)}
                      </strong>
                      <button
                        type="button"
                        className="carrito-eliminar"
                        onClick={() =>
                          setConfirmacion({
                            tipo: 'producto',
                            clave,
                            nombre: producto.nombre,
                          })
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside className="carrito-resumen">
              <h2>Resumen de compra</h2>
              <div className="carrito-resumen-fila">
                <span>Unidades de productos</span><strong>{cantidadProductos}</strong>
              </div>
              <div className="carrito-resumen-fila">
                <span>Servicios seleccionados</span><strong>{cantidadServicios}</strong>
              </div>
              <div className="carrito-resumen-fila">
                <span>Subtotal productos</span><strong>{formatoPrecio(subtotalProductos)}</strong>
              </div>
              <div className="carrito-resumen-fila">
                <span>Subtotal servicios</span><strong>{formatoPrecio(subtotalServicios)}</strong>
              </div>
              <div className="carrito-resumen-fila">
                <span>Despacho</span><strong>Por confirmar</strong>
              </div>
              <div className="carrito-resumen-total">
                <span>Total referencial</span><strong>{formatoPrecio(precioTotal)}</strong>
              </div>
              <button
                type="button"
                className="carrito-boton-principal"
                onClick={() => {
                  setMensaje('')
                  setPaso('datos')
                }}
              >
                Finalizar compra
              </button>
              <p className="carrito-nota">
                Los servicios requieren confirmación de la clínica. El despacho
                y la disponibilidad deben confirmarse. El total es referencial.
              </p>
              <Link to="/catalogo" className="carrito-seguir-resumen">
                + Agregar más elementos
              </Link>
            </aside>
          </div>
        )
      )}
    </main>
  )
}

const estiloCampo = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 7,
  padding: '12px 14px',
  border: '1px solid #dce7e9',
  borderRadius: 10,
  color: '#183344',
  background: '#fff',
  font: 'inherit',
}

export default CarritoPage
