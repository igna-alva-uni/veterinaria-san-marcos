// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api } from './cliente.js'
import { EVENTO_SESION_EXPIRADA, guardarSesion, leerSesion } from './sesion.js'

function respuesta(status, cuerpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(cuerpo === undefined ? '' : JSON.stringify(cuerpo)),
  })
}
const usuarioApi = { id: 1, nombre: 'Administración', apellido: 'San Marcos', email: 'admin@duocuc.cl', rol: 'ADMINISTRADOR', activo: true }

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => vi.unstubAllGlobals())

describe('cliente HTTP hacia el API Gateway', () => {
  it('envía el token como Authorization: Bearer', async () => {
    guardarSesion({ token: 'a.b.c', expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    fetch.mockReturnValue(respuesta(200, [{ id: 1 }]))
    await api('/usuarios')
    const [url, opciones] = fetch.mock.calls[0]
    expect(url).toBe('/api/v1/usuarios')
    expect(opciones.headers.Authorization).toBe('Bearer a.b.c')
  })

  it('no envía token en el login', async () => {
    guardarSesion({ token: 'a.b.c', expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    fetch.mockReturnValue(respuesta(200, {}))
    await api('/auth/login', { method: 'POST', auth: false, body: { email: 'x', password: 'y' } })
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
    expect(fetch.mock.calls[0][1].body).toBe('{"email":"x","password":"y"}')
  })

  it('convierte el error del backend en ApiError con su mensaje', async () => {
    fetch.mockReturnValue(respuesta(409, { status: 409, mensaje: 'Stock insuficiente para Pipeta felina. Disponible: 1.' }))
    await expect(api('/pedidos', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 409,
      message: 'Stock insuficiente para Pipeta felina. Disponible: 1.',
    })
  })

  it('ante 401 con sesión iniciada cierra la sesión y avisa', async () => {
    guardarSesion({ token: 'a.b.c', expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    const escucha = vi.fn()
    window.addEventListener(EVENTO_SESION_EXPIRADA, escucha)
    fetch.mockReturnValue(respuesta(401, { mensaje: 'La sesión expiró. Inicia sesión nuevamente.' }))
    await expect(api('/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(leerSesion()).toBeNull()
    expect(escucha).toHaveBeenCalledTimes(1)
    window.removeEventListener(EVENTO_SESION_EXPIRADA, escucha)
  })

  it('un 403 no cierra la sesión: solo informa que el rol no tiene permiso', async () => {
    guardarSesion({ token: 'a.b.c', expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    fetch.mockReturnValue(respuesta(403, { mensaje: 'Tu rol no tiene permiso para realizar esta acción.' }))
    await expect(api('/usuarios')).rejects.toMatchObject({ status: 403 })
    expect(leerSesion()).not.toBeNull()
  })

  it('informa cuando el backend no está disponible', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(api('/servicios')).rejects.toMatchObject({ status: 0 })
  })
})
