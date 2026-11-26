import { useCallback, useEffect, useState } from 'react'
import { cambiarEstadoPedido, obtenerTodosLosPedidos } from '../api/pedidos.js'

const formatoPrecio = (precio) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(Number(precio) || 0)

/** Acciones disponibles según el estado actual (mismas transiciones que valida el backend). */
const ACCIONES = {
  PENDIENTE: [['CONFIRMADO', 'Confirmar'], ['CANCELADO', 'Cancelar']],
  CONFIRMADO: [['ENTREGADO', 'Marcar entregado'], ['CANCELADO', 'Cancelar']],
  ENTREGADO: [],
  CANCELADO: [],
}

// GET /api/v1/pedidos (solo administración y recepción).
export default function GestionPedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [filtro, setFiltro] = useState('TODOS')

  const cargar = useCallback(async () => {
    try {
      setPedidos(await obtenerTodosLosPedidos())
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function cambiar(pedido, estado, etiqueta) {
    if (estado === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido ${pedido.numero}? Se devolverá el stock.`)) return
    try {
      await cambiarEstadoPedido(pedido.id, estado)
      setMensaje(`Pedido ${pedido.numero}: ${etiqueta.toLowerCase()} correctamente.`)
      await cargar()
    } catch (error) {
      setMensaje(error.message)
    }
  }

  const visibles = pedidos.filter((p) => filtro === 'TODOS' || p.estadoCodigo === filtro)

  return (
    <section className="tarjeta">
      <h1>Pedidos de la tienda</h1>
      <p>Revisa los pedidos generados desde el carrito y actualiza su estado.</p>
      {mensaje && <p role="alert">{mensaje}</p>}
      <label>
        Filtrar por estado
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="TODOS">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="CONFIRMADO">Confirmados</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </label>
      {cargando ? <p role="status">Cargando pedidos...</p> : (
        <div className="tabla-contenedor">
          <div className="tabla overflow-x-auto" role="region" aria-label="Tabla de pedidos" tabIndex={0}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr><th>Número</th><th>Cliente</th><th>Detalle</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {visibles.length === 0 && <tr><td colSpan={6}>No hay pedidos con este filtro.</td></tr>}
                {visibles.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>{pedido.numero}<br /><small>{new Date(pedido.fecha).toLocaleDateString('es-CL')}</small></td>
                    <td>{pedido.cliente.nombre}<br /><small>{pedido.cliente.correo}</small></td>
                    <td>{pedido.productos.map((i) => `${i.nombre} ×${i.cantidad}`).join(', ')}</td>
                    <td>{formatoPrecio(pedido.total)}</td>
                    <td>{pedido.estado}</td>
                    <td>
                      {ACCIONES[pedido.estadoCodigo]?.map(([estado, etiqueta]) => (
                        <button
                          key={estado}
                          type="button"
                          className={estado === 'CANCELADO' ? 'boton-eliminar' : undefined}
                          onClick={() => cambiar(pedido, estado, etiqueta)}
                        >
                          {etiqueta}
                        </button>
                      ))}
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
