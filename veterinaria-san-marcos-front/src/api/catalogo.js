// Catálogo de la tienda desde ms-citas: GET /productos y GET /servicios (lectura pública).
import { useCallback, useEffect, useState } from 'react'
import { api } from './cliente.js'

export const productoDesdeApi = (p) => ({ ...p, tipo: 'producto', id: p.codigo })
export const servicioDesdeApi = (s) => ({ ...s, tipo: 'servicio', id: s.codigo, stock: null })

export async function obtenerCatalogo({ incluirInactivos = false } = {}) {
  const consulta = incluirInactivos ? '?incluirInactivos=true' : ''
  const [productos, servicios] = await Promise.all([
    api(`/productos${consulta}`),
    api(`/servicios${consulta}`),
  ])
  const listaProductos = productos.map(productoDesdeApi)
  const listaServicios = servicios.map(servicioDesdeApi)
  return { productos: listaProductos, servicios: listaServicios, elementos: [...listaProductos, ...listaServicios] }
}

/** Hook para las vistas: carga el catálogo y expone estado de carga, error y recarga. */
export function useCatalogo(opciones = {}) {
  const incluirInactivos = Boolean(opciones.incluirInactivos)
  const [estado, setEstado] = useState({ cargando: true, error: '', productos: [], servicios: [], elementos: [] })

  const recargar = useCallback(async () => {
    setEstado((actual) => ({ ...actual, cargando: true, error: '' }))
    try {
      const catalogo = await obtenerCatalogo({ incluirInactivos })
      setEstado({ cargando: false, error: '', ...catalogo })
    } catch (error) {
      setEstado((actual) => ({ ...actual, cargando: false, error: error.message }))
    }
  }, [incluirInactivos])

  useEffect(() => {
    // Carga inicial desde la API; setState ocurre después de la respuesta.
    recargar()
  }, [recargar])

  return { ...estado, recargar }
}

const cuerpoProducto = (d) => ({
  codigo: d.codigo.trim().toUpperCase(),
  nombre: d.nombre.trim(),
  categoria: d.categoria.trim(),
  principioActivo: d.principioActivo?.trim() ?? '',
  presentacion: d.presentacion?.trim() ?? '',
  especie: d.especie?.trim() || 'TODAS',
  stock: Number(d.stock),
  precio: Number(d.precio),
  activo: d.activo ?? true,
})

export const crearProducto = async (datos) =>
  productoDesdeApi(await api('/productos', { method: 'POST', body: cuerpoProducto(datos) }))

export const actualizarProducto = async (codigo, datos) =>
  productoDesdeApi(await api(`/productos/${encodeURIComponent(codigo)}`, { method: 'PUT', body: cuerpoProducto(datos) }))

/** Devuelve el mensaje del backend: eliminado o desactivado por tener pedidos. */
export async function eliminarProducto(codigo) {
  const respuesta = await api(`/productos/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
  return respuesta?.mensaje ?? 'Producto eliminado correctamente.'
}

const cuerpoServicio = (d) => ({
  codigo: d.codigo.trim().toUpperCase(),
  nombre: d.nombre.trim(),
  categoria: d.categoria.trim(),
  especie: d.especie?.trim() || 'TODAS',
  duracionMinutos: Number(d.duracionMinutos),
  precio: Number(d.precio),
  observaciones: d.observaciones ?? '',
  activo: d.activo ?? true,
})

export const crearServicio = async (datos) =>
  servicioDesdeApi(await api('/servicios', { method: 'POST', body: cuerpoServicio(datos) }))

export const actualizarServicio = async (codigo, datos) =>
  servicioDesdeApi(await api(`/servicios/${encodeURIComponent(codigo)}`, { method: 'PUT', body: cuerpoServicio(datos) }))

export async function eliminarServicio(codigo) {
  const respuesta = await api(`/servicios/${encodeURIComponent(codigo)}`, { method: 'DELETE' })
  return respuesta?.mensaje ?? 'Servicio eliminado correctamente.'
}
