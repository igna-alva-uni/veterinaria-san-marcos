import { api } from './cliente.js'
import { rolHaciaApi, usuarioDesdeApi } from './sesion.js'

export async function listarUsuarios() {
  return (await api('/usuarios')).map(usuarioDesdeApi)
}

export async function crearUsuario(datos) {
  return usuarioDesdeApi(await api('/usuarios', {
    method: 'POST',
    body: {
      run: datos.run,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.correo.trim().toLowerCase(),
      password: datos.clave,
      rol: rolHaciaApi(datos.rol),
      telefono: datos.telefono ?? '',
    },
  }))
}

export async function actualizarUsuario(id, datos) {
  return usuarioDesdeApi(await api(`/usuarios/${id}`, {
    method: 'PUT',
    body: {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.correo.trim().toLowerCase(),
      rol: rolHaciaApi(datos.rol),
      telefono: datos.telefono ?? '',
    },
  }))
}

export async function cambiarEstadoUsuario(id, activo) {
  return usuarioDesdeApi(await api(`/usuarios/${id}/estado`, { method: 'PATCH', body: { activo } }))
}

export async function eliminarUsuario(id) {
  await api(`/usuarios/${id}`, { method: 'DELETE' })
}
