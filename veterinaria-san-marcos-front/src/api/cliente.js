// Cliente HTTP único para hablar con el API Gateway (IE3.2.2).
// Agrega el JWT, convierte las respuestas de error del backend en ApiError
// y, ante un 401 con sesión iniciada, cierra la sesión (token vencido o inválido).
import { notificarSesionExpirada, obtenerToken } from './sesion.js'

export const BASE_API = import.meta.env?.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  constructor(status, mensaje, errores = null) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.errores = errores
  }
}

const MENSAJES_POR_ESTADO = {
  400: 'Los datos enviados no son válidos.',
  401: 'Debes iniciar sesión para continuar.',
  403: 'Tu rol no tiene permiso para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación entra en conflicto con datos existentes.',
  503: 'El servicio no está disponible en este momento. Intenta nuevamente.',
}

export async function api(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? obtenerToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${BASE_API}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.')
  }

  const texto = await respuesta.text()
  let datos = null
  if (texto) {
    try { datos = JSON.parse(texto) } catch { datos = null }
  }

  if (!respuesta.ok) {
    const mensaje = datos?.mensaje || MENSAJES_POR_ESTADO[respuesta.status] || `Error ${respuesta.status} en el servidor.`
    if (respuesta.status === 401 && token) {
      notificarSesionExpirada(datos?.mensaje || 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.')
    }
    throw new ApiError(respuesta.status, mensaje, datos?.errores ?? null)
  }
  return datos
}

/** Convierte un error en el objeto { ok, mensaje } que usan las vistas existentes. */
export function resultadoError(error, mensajePorDefecto = 'No se pudo completar la operación.') {
  return { ok: false, mensaje: error instanceof ApiError ? error.message : mensajePorDefecto, status: error?.status }
}
