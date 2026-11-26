import { act, render, screen } from '@testing-library/react'
import { usuariosIniciales } from '../datos.js'
import { guardarSesion } from './usuariosApi.js'

const roles = { Administrador: 'ADMINISTRADOR', Recepcionista: 'RECEPCIONISTA', Dueño: 'DUENO' }
const aJson = ({ correo, rol, clave, ...datos }) => ({ ...datos, email: correo, rol: roles[rol] })

export function simularApi(vi) {
  guardarSesion(null)
  const cuentas = usuariosIniciales.map(u => ({ ...u, apellido: 'Demo' }))
  const tokens = new Map()
  const credenciales = id => {
    const token = 'token-' + id
    tokens.set(token, id)
    return { token, expiresAt: Date.now() + 3600000 }
  }
  const fetchMock = vi.fn(async (url, opciones) => {
    const ruta = url.replace('/api/v1', '')
    const datos = opciones.body && JSON.parse(opciones.body)
    const responder = (contenido, status = 200) => ({
      status, ok: status < 400, json: async () => contenido,
    })
    if (ruta === '/auth/login') {
      const usuario = cuentas.find(u => u.correo === datos.email && u.clave === datos.password && u.activo)
      return usuario ? responder({ ...credenciales(usuario.id), usuario: aJson(usuario) }) : responder({}, 401)
    }
    const usuario = cuentas.find(u => u.id === tokens.get(opciones.headers.Authorization?.slice(7)) && u.activo)
    if (ruta === '/auth/me') return usuario ? responder(aJson(usuario)) : responder({}, 401)
    if (ruta === '/usuarios/duenos') return responder(cuentas.filter(u => u.rol === 'Dueño').map(aJson))
    const index = cuentas.findIndex(u => ruta === '/usuarios/' + u.id)
    if (opciones.method === 'DELETE' && index !== -1) {
      cuentas.splice(index, 1)
      return responder(null, 204)
    }
    if (datos) {
      const anterior = cuentas[index]
      const cambios = {
        id: anterior?.id ?? Math.max(0, ...cuentas.map(u => u.id)) + 1,
        nombre: datos.nombre, apellido: datos.apellido, correo: datos.email,
        clave: datos.password ?? anterior?.clave, activo: datos.activo ?? true,
        rol: Object.keys(roles).find(rol => roles[rol] === datos.rol) ?? 'Dueño',
      }
      if (anterior) cuentas[index] = cambios
      else cuentas.push(cambios)
      return responder(aJson(cambios))
    }
    return responder(cuentas.map(aJson))
  })
  vi.stubGlobal('fetch', fetchMock)
  return { cuentas, credenciales, fetchMock }
}

export async function renderConSesion(elemento, usuario, api) {
  if (usuario) guardarSesion(usuario, api.credenciales(usuario.id))
  const vista = render(elemento)
  await act(async () => {})
  return vista
}

export function completarIdentidad(fireEvent, run = '123456785') {
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Ejemplo' } })
  fireEvent.change(screen.getByLabelText('RUN'), { target: { value: run } })
}
