import { obtenerSesion } from './veterinaria.js'
import { productosCatalogo } from './catalogo.js'

export const EVENTO_CARRITO = 'vet:carrito'

export function guardarCarritoUsuario(productos) {
  localStorage.setItem(claveCompra('vsm-carrito'), JSON.stringify(productos))
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
    const guardado = localStorage.getItem(`vsm-carrito:${usuarioId}`)
    const anterior = usuarioId === 3 && !localStorage.getItem('vsm-carrito:migrado')
      ? localStorage.getItem('vsm-carrito') : null
    return normalizarCarrito(JSON.parse(guardado ?? anterior ?? '[]'))
      .reduce((total, producto) => total + producto.cantidad, 0)
  } catch { return 0 }
}

// La rama original compartía el carrito entre cuentas del navegador.
export function claveCompra(tipo) {
  const sesion = obtenerSesion()
  if (!sesion) throw new Error('Inicia sesión para acceder al carrito.')
  const clave = `${tipo}:${sesion.id}`
  // Conserva los datos de demostración previos únicamente para la cuenta semilla.
  const marca = `${tipo}:migrado`
  if (!localStorage.getItem(marca)) {
    const anterior = localStorage.getItem(tipo)
    if (anterior && !localStorage.getItem(`${tipo}:3`)) localStorage.setItem(`${tipo}:3`, anterior)
    localStorage.setItem(marca, 'true')
  }
  return clave
}
export function leerCarritoUsuario() {
  try {
    const datos = JSON.parse(localStorage.getItem(claveCompra('vsm-carrito')) || '[]')
    return normalizarCarrito(datos)
  } catch { return [] }
}

function normalizarCarrito(datos) {
  if (!Array.isArray(datos)) return []
  return datos.flatMap(item => {
      const original = productosCatalogo.find(p => p.codigo === item?.codigo)
      if (!original || (original.tipo === 'producto' && original.stock < 1)) return []
      const cantidad = original.tipo === 'servicio' ? 1 : Math.min(original.stock, Math.max(1, Math.floor(Number(item.cantidad) || 1)))
      return [{ ...original, cantidad }]
  })
}
