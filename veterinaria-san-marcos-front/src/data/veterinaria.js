// Mascotas y citas: antes se guardaban en localStorage; desde la EP3 se leen y escriben
// en ms-pacientes y ms-citas a través del API Gateway. Las funciones conservan sus nombres
// y el formato { ok, mensaje } para que las vistas existentes cambien lo mínimo.
import { api, resultadoError } from '../api/cliente.js'
import { leerSesion } from '../api/sesion.js'
import { validarPaciente } from '../validaciones.js'

export const EVENTO_PACIENTES = 'vet:pacientes'
export const EVENTO_CITAS = 'vet:citas'

const avisar = (evento) => window.dispatchEvent(new Event(evento))

export function obtenerSesion() {
  return leerSesion()?.usuario ?? null
}

// ---------- Adaptadores API ↔ vistas ----------

export function atencionDesdeApi(a) {
  return {
    id: a.id,
    fecha: a.fecha ?? '',
    tipo: a.tipo ?? '',
    diagnostico: a.diagnostico ?? '',
    medicamento: a.medicamento ?? '',
    observacion: a.observacion ?? '',
    proximoControl: a.proximoControl ?? '',
    vacuna: a.vacuna?.nombre ? { nombre: a.vacuna.nombre, vencimiento: a.vacuna.vencimiento ?? '' } : null,
  }
}

export function mascotaDesdeApi(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    especie: p.especie,
    raza: p.raza ?? '',
    edad: p.edad ?? '',
    sexo: p.sexo ?? 'No especificado',
    duenoId: p.duenoId,
    observaciones: p.observaciones ?? '',
    historial: (p.historial ?? []).map(atencionDesdeApi),
  }
}

export const ESTADOS_CITA = {
  SOLICITADA: 'Pendiente de confirmación',
  CONFIRMADA: 'Confirmada',
  REAGENDADA: 'Reprogramada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}
const ESTADOS_CITA_API = Object.fromEntries(Object.entries(ESTADOS_CITA).map(([api, vista]) => [vista, api]))

export function citaDesdeApi(c, mascotas = []) {
  const mascota = mascotas.find((m) => String(m.id) === String(c.mascotaId))
  return {
    id: c.id,
    mascotaId: c.mascotaId,
    mascotaNombre: mascota?.nombre ?? `Mascota #${c.mascotaId}`,
    mascotaEspecie: mascota?.especie ?? '',
    duenoId: c.duenoId,
    codigoServicio: c.codigoServicio,
    servicio: c.servicio,
    fecha: c.fecha,
    hora: c.hora,
    motivo: c.motivo ?? '',
    precio: c.precio,
    estado: ESTADOS_CITA[c.estado] ?? c.estado,
    creadaEn: c.creadaEn,
  }
}

function normalizarEdad(edad) {
  if (edad === undefined || edad === null || String(edad).trim() === '') return ''
  const texto = String(edad).trim()
  return /^\d+(?:\s*años?)?$/.test(texto) ? Number.parseInt(texto, 10) : NaN
}

function cuerpoMascota(datos, duenoId) {
  return {
    nombre: datos.nombre?.trim() ?? '',
    especie: datos.especie || 'Otro',
    raza: datos.raza?.trim() || 'No registrada',
    edad: Number(datos.edad),
    sexo: datos.sexo || 'No especificado',
    idDueno: duenoId ? Number(duenoId) : undefined,
    observaciones: datos.observaciones,
  }
}

// ---------- Mascotas (ms-pacientes) ----------

/** El backend filtra por rol: el dueño recibe solo sus mascotas; el personal, todas. */
export async function obtenerMascotas() {
  return (await api('/pacientes')).map(mascotaDesdeApi)
}

export async function obtenerMascotaPorId(id) {
  try {
    return mascotaDesdeApi(await api(`/pacientes/${encodeURIComponent(id)}`))
  } catch (error) {
    if (error.status === 404 || error.status === 403 || error.status === 400) return null
    throw error
  }
}

/** Registro desde "Mis mascotas" (rol Dueño). */
export async function registrarMascota(datos) {
  const sesion = obtenerSesion()
  if (!sesion || sesion.rol !== 'Dueño') return { ok: false, mensaje: 'Inicia sesión como dueño para registrar una mascota.' }
  return crearPaciente({ ...datos, duenoId: sesion.id })
}

/** Registro general: el personal indica duenoId; para un dueño el backend usa el id del token. */
export async function crearPaciente(datos) {
  const edad = normalizarEdad(datos.edad)
  const error = validarPaciente({ ...datos, edad, especie: datos.especie || 'Otro' })
  if (error) return { ok: false, mensaje: error }
  try {
    const mascota = mascotaDesdeApi(await api('/pacientes', { method: 'POST', body: cuerpoMascota({ ...datos, edad }, datos.duenoId) }))
    avisar(EVENTO_PACIENTES)
    return { ok: true, mascota }
  } catch (e) {
    return resultadoError(e, 'No se pudo registrar la mascota.')
  }
}

export async function actualizarMascota(id, cambios) {
  const mascota = await obtenerMascotaPorId(id)
  if (!mascota) return { ok: false, mensaje: 'No se encontró la mascota.' }
  const actualizada = {
    ...mascota,
    nombre: cambios.nombre?.trim() ?? mascota.nombre,
    especie: cambios.especie ?? mascota.especie,
    raza: cambios.raza?.trim() ?? mascota.raza,
    edad: cambios.edad === undefined ? mascota.edad : normalizarEdad(cambios.edad),
    sexo: cambios.sexo ?? mascota.sexo,
  }
  const error = validarPaciente(actualizada)
  if (error) return { ok: false, mensaje: error }
  try {
    const guardada = mascotaDesdeApi(await api(`/pacientes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { ...cuerpoMascota(actualizada), observaciones: undefined },
    }))
    avisar(EVENTO_PACIENTES)
    return { ok: true, mascota: guardada, mensaje: '' }
  } catch (e) {
    return resultadoError(e, 'No se pudieron guardar los cambios.')
  }
}

/** El backend (ms-pacientes) consulta a ms-citas y rechaza con 409 si hay citas activas. */
export async function eliminarMascota(id) {
  try {
    await api(`/pacientes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    avisar(EVENTO_PACIENTES)
    return { ok: true, mensaje: '' }
  } catch (e) {
    return resultadoError(e, 'No se pudo eliminar la mascota.')
  }
}

// ---------- Ficha clínica (personal) ----------

export async function actualizarObservaciones(id, observaciones) {
  try {
    const mascota = mascotaDesdeApi(await api(`/pacientes/${encodeURIComponent(id)}/observaciones`, {
      method: 'PATCH',
      body: { observaciones },
    }))
    avisar(EVENTO_PACIENTES)
    return { ok: true, mascota }
  } catch (e) {
    return resultadoError(e, 'No se pudieron guardar los antecedentes.')
  }
}

export async function registrarAtencion(idPaciente, atencion) {
  try {
    const guardada = atencionDesdeApi(await api(`/pacientes/${encodeURIComponent(idPaciente)}/atenciones`, {
      method: 'POST',
      body: {
        fecha: atencion.fecha,
        tipo: atencion.tipo,
        diagnostico: atencion.diagnostico.trim(),
        medicamento: atencion.medicamento,
        observacion: atencion.observacion,
        proximoControl: atencion.proximoControl || null,
        vacuna: atencion.vacuna?.nombre?.trim()
          ? { nombre: atencion.vacuna.nombre.trim(), vencimiento: atencion.vacuna.vencimiento || null }
          : null,
      },
    }))
    avisar(EVENTO_PACIENTES)
    return { ok: true, atencion: guardada }
  } catch (e) {
    return resultadoError(e, 'No se pudo registrar la atención.')
  }
}

export async function eliminarAtencion(idPaciente, idAtencion) {
  try {
    await api(`/pacientes/${encodeURIComponent(idPaciente)}/atenciones/${encodeURIComponent(idAtencion)}`, { method: 'DELETE' })
    avisar(EVENTO_PACIENTES)
    return { ok: true }
  } catch (e) {
    return resultadoError(e, 'No se pudo eliminar la atención.')
  }
}

// ---------- Citas (ms-citas) ----------

export async function obtenerCitas() {
  const [citas, mascotas] = await Promise.all([api('/citas'), obtenerMascotas().catch(() => [])])
  return citas.map((c) => citaDesdeApi(c, mascotas))
}

export async function obtenerCitaPorId(id) {
  try {
    const [cita, mascotas] = await Promise.all([
      api(`/citas/${encodeURIComponent(id)}`),
      obtenerMascotas().catch(() => []),
    ])
    return citaDesdeApi(cita, mascotas)
  } catch (error) {
    if (error.status === 404 || error.status === 403 || error.status === 400) return null
    throw error
  }
}

/** datos.codigoServicio viene del catálogo cargado desde la API. */
export async function registrarCita(datos) {
  if (!datos.mascotaId) return { ok: false, mensaje: 'Selecciona una mascota registrada.' }
  if (!datos.codigoServicio) return { ok: false, mensaje: 'Selecciona un servicio.' }
  try {
    const cita = citaDesdeApi(await api('/citas', {
      method: 'POST',
      body: {
        idPaciente: Number(datos.mascotaId),
        codigoServicio: datos.codigoServicio,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: datos.motivo?.trim() || '',
      },
    }))
    avisar(EVENTO_CITAS)
    return { ok: true, cita, mensaje: '' }
  } catch (e) {
    return resultadoError(e, 'No se pudo registrar la cita.')
  }
}

export async function actualizarEstadoCita(id, estado) {
  const estadoApi = ESTADOS_CITA_API[estado]
  if (!estadoApi) return { ok: false, mensaje: 'El estado indicado no es válido.' }
  try {
    await api(`/citas/${encodeURIComponent(id)}/estado`, { method: 'PATCH', body: { estado: estadoApi } })
    avisar(EVENTO_CITAS)
    return { ok: true, mensaje: '' }
  } catch (e) {
    return resultadoError(e, 'No se pudo actualizar la cita.')
  }
}

export async function reprogramarCita(id, fecha, hora) {
  try {
    await api(`/citas/${encodeURIComponent(id)}/reprogramar`, { method: 'PATCH', body: { fecha, hora } })
    avisar(EVENTO_CITAS)
    return { ok: true, mensaje: '' }
  } catch (e) {
    return resultadoError(e, 'No se pudo reprogramar la cita.')
  }
}
