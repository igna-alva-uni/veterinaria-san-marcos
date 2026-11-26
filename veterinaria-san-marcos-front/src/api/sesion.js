// Gestión de la sesión en el navegador (IE3.3.2).
// Se guarda SOLO el token, su expiración y datos públicos del usuario: nunca la contraseña.
// Al recargar, App.jsx lee esta sesión y la confirma con GET /api/v1/auth/me.

const CLAVE_SESION = 'vet_sesion'
export const EVENTO_SESION_EXPIRADA = 'vet:sesion-expirada'

const ROLES_DESDE_API = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  VETERINARIO: 'Veterinario',
  DUENO: 'Dueño',
}
const ROLES_HACIA_API = Object.fromEntries(Object.entries(ROLES_DESDE_API).map(([api, vista]) => [vista, api]))

export const rolDesdeApi = (rol) => ROLES_DESDE_API[rol] ?? rol
export const rolHaciaApi = (rol) => ROLES_HACIA_API[rol] ?? rol

export function usuarioDesdeApi(u) {
  return {
    id: u.id,
    run: u.run ?? '',
    nombre: u.nombre ?? '',
    apellido: u.apellido ?? '',
    nombreCompleto: `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim(),
    correo: u.email ?? '',
    telefono: u.telefono ?? '',
    rol: rolDesdeApi(u.rol),
    activo: Boolean(u.activo),
  }
}

/** Lee el payload del JWT (sin validar la firma: eso lo hace el backend). */
export function decodificarToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const bytes = Uint8Array.from(atob(relleno), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function guardarSesion({ token, expiraEn, usuario }) {
  const expiracion = Date.parse(expiraEn) || (decodificarToken(token)?.exp ?? 0) * 1000
  const sesion = { token, expiraEn: expiracion, usuario: usuarioDesdeApi(usuario) }
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  return sesion
}

/** Devuelve la sesión vigente o null. Descarta sesiones vencidas o del formato antiguo (EP2). */
export function leerSesion() {
  let sesion = null
  try {
    sesion = JSON.parse(localStorage.getItem(CLAVE_SESION))
  } catch {
    sesion = null
  }
  if (!sesion) return null
  if (!sesion.token || !sesion.usuario || !sesion.expiraEn || Date.now() >= sesion.expiraEn) {
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
  return sesion
}

export function actualizarUsuarioSesion(usuarioApi) {
  const sesion = leerSesion()
  if (!sesion) return null
  const actualizada = { ...sesion, usuario: usuarioDesdeApi(usuarioApi) }
  localStorage.setItem(CLAVE_SESION, JSON.stringify(actualizada))
  return actualizada
}

export const obtenerToken = () => leerSesion()?.token ?? null

export function cerrarSesionLocal() {
  localStorage.removeItem(CLAVE_SESION)
}

/** Cierra la sesión local y avisa a la App para que redirija al login con el mensaje. */
export function notificarSesionExpirada(mensaje = 'Tu sesión expiró. Inicia sesión nuevamente.') {
  cerrarSesionLocal()
  window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: mensaje }))
}

/**
 * Las entregas anteriores guardaban usuarios (con contraseñas en texto plano), mascotas,
 * citas y pedidos en localStorage. Ahora esos datos viven en el backend, así que se limpian.
 */
export function limpiarDatosLocalesAntiguos() {
  try {
    for (const clave of Object.keys(localStorage)) {
      if (['vet_usuarios', 'vet_pacientes', 'vsm-citas', 'vsm-mascotas', 'vsm-mascotas-migradas'].includes(clave)
        || clave.startsWith('vsm-pedidos')) {
        localStorage.removeItem(clave)
      }
    }
  } catch { /* almacenamiento no disponible */ }
}
