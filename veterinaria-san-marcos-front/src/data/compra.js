// Carrito de compras: se mantiene en el navegador, separado por usuario, porque es un estado
// temporal de la sesión. El catálogo (precios y stock) y la confirmación del pedido vienen del backend.
import { obtenerSesion } from './veterinaria.js'

export const EVENTO_CARRITO = 'vet:carrito'

export function guardarCarritoUsuario(productos) {
  const minimos = productos.map((p) => ({ codigo: p.codigo, tipo: p.tipo, cantidad: p.cantidad }))
  localStorage.setItem(claveCompra('vsm-carrito'), JSON.stringify(minimos))
  window.dispatchEvent(new Event(EVENTO_CARRITO))
}

export function suscribirCarrito(actualizar) {
  window.addEventListener(EVENTO_CARRITO, actualizar)
  window.addEventListener('storage', actualizar)
  return () => {
    window.removeEventListener(EVENTO_CARRITO, actualizar)
    window.removeEventListener('storage', actualizar)
  }
}

// Snapshot numérico sin escrituras, para actualizar el navbar con useSyncExternalStore.
export function cantidadCarritoUsuario(usuarioId) {
  if (!usuarioId) return 0
  try {
    const datos = JSON.parse(localStorage.getItem(`vsm-carrito:${usuarioId}`) ?? '[]')
    if (!Array.isArray(datos)) return 0
    return datos.reduce((total, item) => total + (item?.tipo === 'servicio' ? 1 : Math.max(1, Math.floor(Number(item?.cantidad) || 1))), 0)
  } catch { return 0 }
}

export function claveCompra(tipo) {
  const sesion = obtenerSesion()
  if (!sesion) throw new Error('Inicia sesión para acceder al carrito.')
  return `${tipo}:${sesion.id}`
}

/**
 * Lee el carrito guardado y lo cruza con el catálogo actual de la API:
 * descarta lo que ya no existe o no tiene stock y ajusta cantidades al stock disponible.
 */
export function leerCarritoUsuario(catalogo = []) {
  try {
    const datos = JSON.parse(localStorage.getItem(claveCompra('vsm-carrito')) || '[]')
    return normalizarCarrito(datos, catalogo)
  } catch { return [] }
}

export function normalizarCarrito(datos, catalogo = []) {
  if (!Array.isArray(datos)) return []
  return datos.flatMap((item) => {
    const original = catalogo.find((p) => p.codigo === item?.codigo)
    if (!original || (original.tipo === 'producto' && original.stock < 1)) return []
    const cantidad = original.tipo === 'servicio'
      ? 1
      : Math.min(original.stock, Math.max(1, Math.floor(Number(item.cantidad) || 1)))
    return [{ ...original, cantidad }]
  })
}
