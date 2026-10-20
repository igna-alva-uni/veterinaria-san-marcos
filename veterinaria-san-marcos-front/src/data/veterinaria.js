import { pacientesIniciales, usuariosIniciales } from '../datos.js'
import { validarPaciente } from '../validaciones.js'

export const EVENTO_PACIENTES = 'vet:pacientes'
const CLAVE_PACIENTES = 'vet_pacientes'
const CLAVE_CITAS = 'vsm-citas'

function leer(clave, defecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto } catch { return defecto }
}
function leerLista(clave, defecto = []) {
  const lista = leer(clave, defecto)
  return Array.isArray(lista) ? lista : defecto
}
function guardarLista(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos))
    if (clave === CLAVE_PACIENTES) window.dispatchEvent(new Event(EVENTO_PACIENTES))
    return true
  } catch { return false }
}
export function obtenerSesion() {
  const guardada = leer('vet_sesion', null)
  return leerLista('vet_usuarios', usuariosIniciales).find(u => u.id === guardada?.id && u.activo) ?? null
}
function esPersonal() {
  return ['Administrador', 'Recepcionista'].includes(obtenerSesion()?.rol)
}
function puedeVer(duenoId) {
  const sesion = obtenerSesion()
  return Boolean(sesion && (esPersonal() || String(sesion.id) === String(duenoId)))
}
function normalizarEdad(edad) {
  if (edad === undefined || String(edad).trim() === '') return ''
  const texto = String(edad).trim()
  return /^\d+(?:\s*años?)?$/.test(texto) ? Number.parseInt(texto, 10) : NaN
}

// Conserva los pacientes de recepción y migra mascotas de la rama anterior una vez.
// Los registros de demostración sin dueño pertenecen exclusivamente al cliente semilla 3.
export function leerPacientesCompartidos() {
  const pacientes = leerLista(CLAVE_PACIENTES, pacientesIniciales)
  if (!localStorage.getItem('vsm-mascotas-migradas')) {
    const anteriores = leerLista('vsm-mascotas')
    const migrados = [...pacientes]
    for (const mascota of anteriores) {
      if (!migrados.some(p => String(p.id) === String(mascota.id))) {
        const edad = normalizarEdad(mascota.edad)
        migrados.push({ ...mascota, edad: Number.isFinite(edad) ? edad : 0,
          duenoId: mascota.duenoId ?? 3, historial: mascota.historial ?? [], observaciones: mascota.observaciones ?? '' })
      }
    }
    // No sobrescribe el estado inicial de React ni emite eventos durante renderizado.
    if (anteriores.length) {
      localStorage.setItem(CLAVE_PACIENTES, JSON.stringify(migrados))
    }
    localStorage.setItem('vsm-mascotas-migradas', 'true')
    return migrados
  }
  return pacientes
}
export function obtenerMascotas() {
  return leerPacientesCompartidos().filter(p => puedeVer(p.duenoId))
}
export function obtenerMascotaPorId(id) {
  return obtenerMascotas().find(p => String(p.id) === String(id)) ?? null
}
export function registrarMascota(datos) {
  const sesion = obtenerSesion()
  if (!sesion || sesion.rol !== 'Dueño') return { ok: false, mensaje: 'Inicia sesión como dueño para registrar una mascota.' }
  const mascota = { id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())), nombre: datos.nombre?.trim() ?? '', especie: datos.especie || 'Otro',
    raza: datos.raza?.trim() || 'No registrada', edad: normalizarEdad(datos.edad), sexo: datos.sexo || 'No especificado',
    duenoId: sesion.id, historial: [], observaciones: '' }
  const error = validarPaciente(mascota)
  if (error) return { ok: false, mensaje: error }
  if (!guardarLista(CLAVE_PACIENTES, [...leerPacientesCompartidos(), mascota])) return { ok: false, mensaje: 'No se pudo guardar la mascota en este navegador.' }
  return { ok: true, mascota }
}
export function actualizarMascota(id, cambios) {
  const mascota = obtenerMascotaPorId(id)
  if (!mascota) return { ok: false, mensaje: 'No se encontró la mascota.' }
  const actualizada = { ...mascota, nombre: cambios.nombre?.trim() ?? mascota.nombre,
    especie: cambios.especie ?? mascota.especie, raza: cambios.raza?.trim() ?? mascota.raza,
    edad: cambios.edad === undefined ? mascota.edad : normalizarEdad(cambios.edad), sexo: cambios.sexo ?? mascota.sexo }
  const error = validarPaciente(actualizada)
  if (error) return { ok: false, mensaje: error }
  const ok = guardarLista(CLAVE_PACIENTES, leerPacientesCompartidos().map(p => String(p.id) === String(id) ? actualizada : p))
  return { ok, mensaje: ok ? '' : 'No se pudieron guardar los cambios.' }
}
export function eliminarMascota(id) {
  if (!obtenerMascotaPorId(id)) return { ok: false, mensaje: 'No se encontró la mascota.' }
  const pendiente = leerLista(CLAVE_CITAS).some(c => String(c.mascotaId) === String(id) && c.estado !== 'Cancelada')
  if (pendiente) return { ok: false, mensaje: 'Cancela las citas activas antes de eliminar esta mascota.' }
  const ok = guardarLista(CLAVE_PACIENTES, leerPacientesCompartidos().filter(p => String(p.id) !== String(id)))
  return { ok, mensaje: ok ? '' : 'No se pudo eliminar la mascota.' }
}
function todasLasCitas() {
  const pacientes = leerPacientesCompartidos()
  return leerLista(CLAVE_CITAS).map(c => ({ ...c, duenoId: c.duenoId ?? pacientes.find(p => String(p.id) === String(c.mascotaId))?.duenoId ?? 3 }))
}
export function obtenerCitas() {
  return todasLasCitas().filter(c => puedeVer(c.duenoId))
}
export function obtenerCitaPorId(id) {
  return obtenerCitas().find(c => String(c.id) === String(id)) ?? null
}
function validarHorario(fecha, hora) {
  const hoy = new Date()
  const limite = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`
  const parsed = new Date(`${fecha}T12:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== Number(fecha.slice(0,4)) || parsed.getMonth()+1 !== Number(fecha.slice(5,7)) || parsed.getDate() !== Number(fecha.slice(8,10)) || fecha < limite) return 'Selecciona una fecha válida igual o posterior a hoy.'
  if (!['09:00','10:00','11:00','12:00','15:00','16:00','17:00'].includes(hora)) return 'Selecciona un horario válido.'
  return ''
}
function ocupado(fecha, hora, excluir) {
  return todasLasCitas().some(c => String(c.id) !== String(excluir) && c.fecha === fecha && c.hora === hora && c.estado !== 'Cancelada')
}
export function registrarCita(datos) {
  const mascota = obtenerMascotaPorId(datos.mascotaId)
  if (!mascota) return { ok: false, mensaje: 'Selecciona una mascota registrada.' }
  if (!datos.servicio?.trim()) return { ok: false, mensaje: 'Selecciona un servicio.' }
  const error = validarHorario(datos.fecha, datos.hora)
  if (error) return { ok: false, mensaje: error }
  if (ocupado(datos.fecha, datos.hora)) return { ok: false, mensaje: 'Ese horario ya tiene una solicitud activa.' }
  const cita = { id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now())), mascotaId: mascota.id, mascotaNombre: mascota.nombre, duenoId: mascota.duenoId,
    servicio: datos.servicio, fecha: datos.fecha, hora: datos.hora, motivo: datos.motivo?.trim() || '', precio: datos.precio ?? null,
    estado: 'Pendiente de confirmación', creadaEn: new Date().toISOString() }
  const ok = guardarLista(CLAVE_CITAS, [...todasLasCitas(), cita])
  return { ok, cita: ok ? cita : undefined, mensaje: ok ? '' : 'No se pudo guardar la cita en este navegador.' }
}
export function actualizarEstadoCita(id, estado) {
  if (!esPersonal()) return { ok: false, mensaje: 'Solo recepción o administración puede cambiar el estado.' }
  if (!['Pendiente de confirmación', 'Confirmada', 'Cancelada', 'Reprogramada'].includes(estado)) return { ok: false, mensaje: 'El estado indicado no es válido.' }
  const cita = obtenerCitaPorId(id)
  if (!cita) return { ok: false, mensaje: 'No se encontró la cita.' }
  if (estado !== 'Cancelada' && ocupado(cita.fecha, cita.hora, id)) return { ok: false, mensaje: 'Ese horario ya tiene una solicitud activa.' }
  const ok = guardarLista(CLAVE_CITAS, todasLasCitas().map(c => String(c.id) === String(id) ? { ...c, estado } : c))
  return { ok, mensaje: ok ? '' : 'No se pudo actualizar la cita.' }
}
export function reprogramarCita(id, fecha, hora) {
  if (!esPersonal()) return { ok: false, mensaje: 'Solo recepción o administración puede reagendar.' }
  if (!obtenerCitaPorId(id)) return { ok: false, mensaje: 'No se encontró la cita.' }
  const error = validarHorario(fecha, hora)
  if (error) return { ok: false, mensaje: error }
  if (ocupado(fecha, hora, id)) return { ok: false, mensaje: 'Ese horario ya tiene una solicitud activa.' }
  const ok = guardarLista(CLAVE_CITAS, todasLasCitas().map(c => String(c.id) === String(id) ? { ...c, fecha, hora, estado: 'Pendiente de confirmación' } : c))
  return { ok, mensaje: ok ? '' : 'No se pudo reprogramar la cita.' }
}
