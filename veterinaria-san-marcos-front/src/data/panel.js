export function leerCitasPanel() {
  try { return localStorage.getItem('vsm-citas') || '[]' } catch { return '[]' }
}
export function suscribirCitasPanel(actualizar) {
  window.addEventListener('vet:citas', actualizar)
  window.addEventListener('storage', actualizar)
  return () => {
    window.removeEventListener('vet:citas', actualizar)
    window.removeEventListener('storage', actualizar)
  }
}
export function fechaLocal(fecha = new Date()) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`
}
export function resumirPanel(usuarios, pacientes, citas, hoy = fechaLocal()) {
  const pendientes = citas.filter(c => ['Pendiente de confirmación','Reprogramada'].includes(c.estado))
  const delDia = citas.filter(c => c.fecha === hoy && c.estado !== 'Cancelada')
  const proximas = citas.filter(c => c.fecha >= hoy && c.estado !== 'Cancelada')
    .sort((a,b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))
  return {
    usuariosActivos: usuarios.filter(u => u.activo).length,
    pacientes: pacientes.length,
    atenciones: pacientes.reduce((total,p) => total+(p.historial?.length || 0),0),
    pendientes: pendientes.length,
    confirmadasHoy: delDia.filter(c => c.estado === 'Confirmada').length,
    citasHoy: delDia.length,
    proximas: proximas.slice(0,5),
  }
}
