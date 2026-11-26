// Pedidos de la tienda en ms-citas. El frontend envía solo código, tipo y cantidad:
// el backend calcula precios y total, y descuenta el stock.
import { api } from './cliente.js'

export const ESTADOS_PEDIDO = {
  PENDIENTE: 'Pendiente de confirmación',
  CONFIRMADO: 'Confirmado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function pedidoDesdeApi(p) {
  return {
    ...p,
    estadoCodigo: p.estado,
    estado: ESTADOS_PEDIDO[p.estado] ?? p.estado,
    productos: p.items.map((item) => ({
      ...item,
      tipo: item.tipo === 'SERVICIO' ? 'servicio' : 'producto',
      precio: item.precioUnitario,
    })),
  }
}

export async function confirmarPedido(cliente, elementos) {
  const pedido = await api('/pedidos', {
    method: 'POST',
    body: {
      cliente,
      items: elementos.map((elemento) => ({
        tipo: elemento.tipo === 'servicio' ? 'SERVICIO' : 'PRODUCTO',
        codigo: elemento.codigo,
        cantidad: elemento.tipo === 'servicio' ? 1 : Number(elemento.cantidad) || 1,
      })),
    },
  })
  return pedidoDesdeApi(pedido)
}

export const obtenerMisPedidos = async () => (await api('/pedidos/mios')).map(pedidoDesdeApi)
export const obtenerTodosLosPedidos = async () => (await api('/pedidos')).map(pedidoDesdeApi)

export async function cambiarEstadoPedido(id, estadoCodigo) {
  return pedidoDesdeApi(await api(`/pedidos/${id}/estado`, { method: 'PATCH', body: { estado: estadoCodigo } }))
}
