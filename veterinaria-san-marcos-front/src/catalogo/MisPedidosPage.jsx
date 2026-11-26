import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cambiarEstadoPedido, obtenerMisPedidos } from '../api/pedidos.js'

const formatoPrecio = (precio) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(Number(precio) || 0)

const formatoFecha = (fecha) => new Date(fecha).toLocaleString('es-CL', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

// GET /api/v1/pedidos/mios: cada usuario ve solo sus pedidos (el backend usa el id del token).
export default function MisPedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    try {
      setPedidos(await obtenerMisPedidos())
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function cancelar(pedido) {
    if (!window.confirm(`¿Cancelar el pedido ${pedido.numero}? El stock reservado se liberará.`)) return
    try {
      await cambiarEstadoPedido(pedido.id, 'CANCELADO')
      setMensaje(`Pedido ${pedido.numero} cancelado.`)
      await cargar()
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <section className="tarjeta">
      <h1>Mis pedidos</h1>
      <p>Pedidos registrados desde el carrito de la tienda.</p>
      {mensaje && <p role="alert">{mensaje}</p>}
      {cargando ? <p role="status">Cargando pedidos...</p> : pedidos.length === 0 ? (
        <p>Todavía no tienes pedidos. <Link to="/catalogo">Ir al catálogo</Link></p>
      ) : pedidos.map((pedido) => (
        <article className="historial" key={pedido.id}>
          <strong>{pedido.numero} · {pedido.estado}</strong>
          <p>{formatoFecha(pedido.fecha)} · Total {formatoPrecio(pedido.total)}</p>
          <ul>
            {pedido.productos.map((item) => (
              <li key={`${item.tipo}-${item.codigo}`}>
                {item.nombre} × {item.cantidad} — {formatoPrecio(item.subtotal)}
              </li>
            ))}
          </ul>
          {pedido.estadoCodigo === 'PENDIENTE' && (
            <button type="button" className="boton-eliminar" onClick={() => cancelar(pedido)}>
              Cancelar pedido
            </button>
          )}
        </article>
      ))}
    </section>
  )
}
