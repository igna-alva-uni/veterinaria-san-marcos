import { obtenerSesion } from './veterinaria.js'
import { productosCatalogo } from './catalogo.js'

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
    if (!Array.isArray(datos)) return []
    return datos.flatMap(item => {
      const original = productosCatalogo.find(p => p.codigo === item?.codigo)
      if (!original || (original.tipo === 'producto' && original.stock < 1)) return []
      const cantidad = original.tipo === 'servicio' ? 1 : Math.min(original.stock, Math.max(1, Math.floor(Number(item.cantidad) || 1)))
      return [{ ...original, cantidad }]
    })
  } catch { return [] }
}
