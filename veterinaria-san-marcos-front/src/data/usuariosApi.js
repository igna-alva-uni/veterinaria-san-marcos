const CLAVE_SESION = 'vsm-auth'
export const SESION_INVALIDA = 'vet:sesion-invalida'

const roles = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  VETERINARIO: 'Veterinario',
  DUENO: 'Dueño',
}

let usuarioActual = null

export function leerCredenciales() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export function guardarSesion(usuario, credenciales = leerCredenciales()) {
  usuarioActual = usuario
  if (usuario && credenciales) localStorage.setItem(CLAVE_SESION, JSON.stringify(credenciales))
  else localStorage.removeItem(CLAVE_SESION)
}

export function obtenerUsuarioActual() {
  return usuarioActual
}

function usuarioDeApi({ email, rol, ...datos }) {
  return { ...datos, correo: email, rol: roles[rol] ?? rol }
}

function datosDeFormulario({ nombre, apellido, run, correo, telefono, clave, rol, activo }) {
  return {
    nombre: nombre?.trim(),
    apellido: apellido?.trim(),
    run: run?.replace(/[.\s-]/g, '').toUpperCase(),
    email: correo?.trim().toLowerCase(),
    telefono: telefono?.trim() || null,
    password: clave,
    rol: Object.keys(roles).find(codigo => roles[codigo] === rol),
    activo,
  }
}

async function solicitar(ruta, { metodo = 'GET', datos, token } = {}) {
  let respuesta
  try {
    respuesta = await fetch('/api/v1' + ruta, {
      method: metodo,
      headers: {
        ...(datos && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: 'Bearer ' + token }),
      },
      body: datos && JSON.stringify(datos),
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de usuarios.')
  }

  if (!respuesta.ok) {
    const problema = await respuesta.json().catch(() => ({}))
    if (respuesta.status === 401 && token && leerCredenciales()?.token === token) {
      window.dispatchEvent(new Event(SESION_INVALIDA))
    }
    const mensaje = {
      400: 'Revisa los datos ingresados.',
      401: token ? 'Tu sesión venció o dejó de ser válida.' : 'Credenciales inválidas o usuario desactivado.',
      403: 'Acceso denegado.',
      409: 'El correo o RUN ya está registrado.',
    }[respuesta.status]
    throw new Error(problema.detail === 'Invalid request content.' ? mensaje : problema.detail || mensaje || 'El servicio de usuarios no está disponible.')
  }

  return respuesta.status === 204 ? undefined : respuesta.json()
}

function autenticada(ruta, opciones) {
  return solicitar(ruta, { ...opciones, token: leerCredenciales()?.token })
}

export const usuariosApi = {
  async login(correo, clave) {
    const { usuario, token, expiresAt } = await solicitar('/auth/login', {
      metodo: 'POST',
      datos: { email: correo.trim().toLowerCase(), password: clave },
    })
    return { usuario: usuarioDeApi(usuario), credenciales: { token, expiresAt } }
  },
  registro(datos) {
    return solicitar('/auth/registro', { metodo: 'POST', datos: datosDeFormulario(datos) })
  },
  async perfil() {
    return usuarioDeApi(await autenticada('/auth/me'))
  },
  async editarPerfil(datos) {
    return usuarioDeApi(await autenticada('/auth/me', { metodo: 'PUT', datos: datosDeFormulario(datos) }))
  },
  async listar(soloDuenos) {
    const filas = await autenticada(soloDuenos ? '/usuarios/duenos' : '/usuarios')
    return filas.map(usuarioDeApi)
  },
  async guardar(datos) {
    const ruta = datos.id ? '/usuarios/' + datos.id : '/usuarios'
    return usuarioDeApi(await autenticada(ruta, { metodo: datos.id ? 'PUT' : 'POST', datos: datosDeFormulario(datos) }))
  },
  eliminar(id) {
    return autenticada('/usuarios/' + id, { metodo: 'DELETE' })
  },
}
