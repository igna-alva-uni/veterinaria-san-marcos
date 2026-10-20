import { fechaLocal } from './panel.js'

// Fechas civiles: UTC solo se usa para contar días sin cambios de horario de verano.
export function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return false
  const valor = new Date(`${fecha}T12:00:00Z`)
  return !Number.isNaN(valor.getTime()) && valor.toISOString().slice(0, 10) === fecha
}
export function vacunaDeAtencion(atencion) {
  if (atencion.vacuna?.nombre?.trim()) return atencion.vacuna
  // Compatibilidad con las fichas anteriores, sin inventar fechas de vencimiento.
  const nombre = [atencion.medicamento, atencion.tipo].find(valor => /^vacuna\b/i.test(valor || ''))
  return nombre ? { nombre, vencimiento: '' } : null
}
export function obtenerVacunas(historial = [], hoy = fechaLocal()) {
  const ultimas = new Map()
  for (const atencion of historial) {
    const vacuna = vacunaDeAtencion(atencion)
    if (!vacuna) continue
    const clave = vacuna.nombre.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (!ultimas.has(clave) || atencion.fecha >= ultimas.get(clave).fecha) ultimas.set(clave, { ...vacuna, fecha: atencion.fecha })
  }
  return [...ultimas.values()].map(vacuna => {
    if (!fechaValida(vacuna.vencimiento)) return { ...vacuna, estado: 'Sin vencimiento registrado', aviso: false }
    const dias = Math.round((Date.parse(`${vacuna.vencimiento}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / 86400000)
    const estado = dias < 0 ? 'Vencida' : dias === 0 ? 'Vence hoy' : dias <= 30 ? 'Por vencer' : 'Vigente'
    return { ...vacuna, dias, estado, aviso: dias <= 30 }
  }).sort((a, b) => (a.vencimiento || '9999').localeCompare(b.vencimiento || '9999'))
}

export function avisosDeVacunas(pacientes, hoy = fechaLocal()) {
  return pacientes.flatMap(p => obtenerVacunas(p.historial, hoy).filter(v => v.aviso)
    .map(v => ({ ...v, mascotaId: p.id, mascotaNombre: p.nombre })))
}
