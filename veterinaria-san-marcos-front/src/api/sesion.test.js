// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EVENTO_SESION_EXPIRADA,
  decodificarToken,
  guardarSesion,
  leerSesion,
  limpiarDatosLocalesAntiguos,
  notificarSesionExpirada,
  rolDesdeApi,
  rolHaciaApi,
} from './sesion.js'

// JWT de ejemplo (firma ficticia): {"sub":"3","nombre":"Cliente","rol":"DUENO","exp":4102444800}
function tokenDePrueba(payload) {
  const base64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${base64}.firma`
}
const usuarioApi = { id: 3, run: '33333333-3', nombre: 'Cliente', apellido: 'Demo', email: 'cliente@profesor.duoc.cl', rol: 'DUENO', telefono: null, activo: true }

beforeEach(() => localStorage.clear())

describe('sesión con JWT en el navegador', () => {
  it('traduce los roles entre la API y las vistas', () => {
    expect(rolDesdeApi('DUENO')).toBe('Dueño')
    expect(rolHaciaApi('Administrador')).toBe('ADMINISTRADOR')
  })

  it('decodifica el payload del token', () => {
    const token = tokenDePrueba({ sub: '3', rol: 'DUENO', exp: 4102444800 })
    expect(decodificarToken(token)).toMatchObject({ sub: '3', rol: 'DUENO' })
    expect(decodificarToken('no-es-un-token')).toBeNull()
  })

  it('guarda token y usuario sin contraseña y los recupera al recargar', () => {
    const token = tokenDePrueba({ sub: '3', exp: 4102444800 })
    guardarSesion({ token, expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    const guardada = JSON.parse(localStorage.getItem('vet_sesion'))
    expect(guardada.usuario).not.toHaveProperty('clave')
    expect(leerSesion().usuario).toMatchObject({ id: 3, rol: 'Dueño', correo: 'cliente@profesor.duoc.cl' })
  })

  it('descarta una sesión vencida', () => {
    guardarSesion({ token: tokenDePrueba({ sub: '3' }), expiraEn: '2000-01-01T00:00:00Z', usuario: usuarioApi })
    expect(leerSesion()).toBeNull()
    expect(localStorage.getItem('vet_sesion')).toBeNull()
  })

  it('descarta el formato antiguo de la EP2 (usuario con clave y sin token)', () => {
    localStorage.setItem('vet_sesion', JSON.stringify({ id: 1, clave: 'Admin12345' }))
    expect(leerSesion()).toBeNull()
  })

  it('avisa a la aplicación cuando la sesión expira', () => {
    const escucha = vi.fn()
    window.addEventListener(EVENTO_SESION_EXPIRADA, escucha)
    guardarSesion({ token: tokenDePrueba({ sub: '3' }), expiraEn: '2099-01-01T00:00:00Z', usuario: usuarioApi })
    notificarSesionExpirada('Expiró')
    expect(escucha).toHaveBeenCalledTimes(1)
    expect(escucha.mock.calls[0][0].detail).toBe('Expiró')
    expect(leerSesion()).toBeNull()
    window.removeEventListener(EVENTO_SESION_EXPIRADA, escucha)
  })

  it('elimina los usuarios con contraseñas que guardaba la versión anterior', () => {
    localStorage.setItem('vet_usuarios', '[{"clave":"Admin12345"}]')
    localStorage.setItem('vsm-carrito:3', '[]')
    limpiarDatosLocalesAntiguos()
    expect(localStorage.getItem('vet_usuarios')).toBeNull()
    expect(localStorage.getItem('vsm-carrito:3')).toBe('[]')
  })
})
