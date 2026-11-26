import { api } from './cliente.js'
import { guardarSesion, actualizarUsuarioSesion, usuarioDesdeApi } from './sesion.js'

/** POST /auth/login → guarda token y usuario. Devuelve el usuario en formato de la vista. */
export async function iniciarSesion(correo, clave) {
  const respuesta = await api('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email: correo.trim().toLowerCase(), password: clave },
  })
  return guardarSesion(respuesta).usuario
}

export async function registrarDueno(datos) {
  return usuarioDesdeApi(await api('/auth/registro', {
    method: 'POST',
    auth: false,
    body: {
      run: datos.run,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.correo.trim().toLowerCase(),
      password: datos.clave,
      telefono: datos.telefono ?? '',
    },
  }))
}

/** GET /auth/me: confirma con el backend que la sesión guardada sigue siendo válida. */
export async function verificarSesion() {
  const usuario = await api('/auth/me')
  return actualizarUsuarioSesion(usuario)?.usuario ?? usuarioDesdeApi(usuario)
}

export async function actualizarPerfil({ nombre, apellido, telefono }) {
  const usuario = await api('/usuarios/me', {
    method: 'PUT',
    body: { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono ?? '' },
  })
  return actualizarUsuarioSesion(usuario)?.usuario ?? usuarioDesdeApi(usuario)
}
