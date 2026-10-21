import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { fechaLocal, leerCitasPanel, resumirPanel, suscribirCitasPanel } from '../../data/panel.js'
import './PanelPage.css'

const accesosAdmin = [
  {titulo:'Usuarios',texto:'Crea cuentas, asigna roles y gestiona los accesos.',ruta:'/admin/usuarios',icono:'+'},
  {titulo:'Reportes',texto:'Consulta el historial de atenciones por período.',ruta:'/admin/reportes',icono:'↗'},
  {titulo:'Pacientes',texto:'Revisa los registros y las fichas clínicas.',ruta:'/recepcion/pacientes',icono:'♡'},
  {titulo:'Solicitudes de citas',texto:'Supervisa las solicitudes y sus horarios.',ruta:'/recepcion/solicitudes',icono:'✓'},
]
const accesosRecepcion = [
  {titulo:'Solicitudes de citas',texto:'Confirma, cancela o reprograma una atención.',ruta:'/recepcion/solicitudes',icono:'✓'},
  {titulo:'Pacientes',texto:'Registra mascotas y actualiza sus fichas clínicas.',ruta:'/recepcion/pacientes',icono:'+'},
]
function formatearFecha(fecha) {
  const valor = new Date(`${fecha}T12:00:00`)
  return Number.isNaN(valor.getTime()) ? 'Sin fecha' : valor.toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'})
}
export default function PanelPage({ tipo, usuario, usuarios, pacientes }) {
  const snapshot = useSyncExternalStore(suscribirCitasPanel, leerCitasPanel, () => '[]')
  let citas
  try { citas=JSON.parse(snapshot) } catch { citas=[] }
  if (!Array.isArray(citas)) citas=[]
  const resumen = resumirPanel(usuarios,pacientes,citas)
  const administrador = tipo === 'admin'
  const accesos = administrador ? accesosAdmin : accesosRecepcion
  const metricas = administrador ? [
    {valor:resumen.usuariosActivos,nombre:'Usuarios activos',ruta:'/admin/usuarios'},
    {valor:resumen.pacientes,nombre:'Pacientes registrados',ruta:'/recepcion/pacientes'},
    {valor:resumen.pendientes,nombre:'Solicitudes pendientes',ruta:'/recepcion/solicitudes'},
    {valor:resumen.atenciones,nombre:'Atenciones registradas',ruta:'/admin/reportes'},
  ] : [
    {valor:resumen.pendientes,nombre:'Solicitudes pendientes',ruta:'/recepcion/solicitudes'},
    {valor:resumen.citasHoy,nombre:'Citas de hoy',ruta:'/recepcion/solicitudes'},
    {valor:resumen.confirmadasHoy,nombre:'Confirmadas hoy',ruta:'/recepcion/solicitudes'},
    {valor:resumen.pacientes,nombre:'Pacientes registrados',ruta:'/recepcion/pacientes'},
  ]
  return (
    <div className="panel-page">
      <section className="panel-welcome">
        <div><span className="panel-eyebrow">{administrador?'Administración':'Recepción'} · {formatearFecha(fechaLocal())}</span><h1>Resumen de {administrador?'administración':'recepción'}</h1><p>Hola, {usuario.nombre}. {administrador?'Consulta el estado de la clínica y accede a sus módulos de gestión.':'Organiza las solicitudes y prepara las próximas atenciones.'}</p></div>
        <Link className="site-button" to={administrador?'/admin/usuarios':'/recepcion/solicitudes'}>{administrador?'Gestionar usuarios':'Revisar solicitudes'} <span aria-hidden="true">→</span></Link>
      </section>
      <section className="panel-metrics" aria-label="Indicadores del panel">{metricas.map(m=><Link className="panel-metric" to={m.ruta} key={m.nombre}><span>{m.nombre}</span><strong>{m.valor}</strong><span className="panel-metric-link">Ver detalles <span aria-hidden="true">↗</span></span></Link>)}</section>
      <section className="panel-section" aria-labelledby="accesos-panel"><h2 id="accesos-panel">Accesos de gestión</h2><div className="panel-shortcuts">{accesos.map(a=><Link className="panel-shortcut" to={a.ruta} key={a.ruta}><span className="panel-icon" aria-hidden="true">{a.icono}</span><div><h3>{a.titulo}</h3><p>{a.texto}</p></div><span aria-hidden="true">↗</span></Link>)}</div></section>
      <section className="panel-section panel-agenda" aria-labelledby="agenda-panel"><div className="panel-section-heading"><div><span className="panel-eyebrow">Agenda</span><h2 id="agenda-panel">Próximas citas</h2></div><Link to="/recepcion/solicitudes">Ver todas las solicitudes <span aria-hidden="true">→</span></Link></div>
        {resumen.proximas.length ? <div className="panel-table-scroll" role="region" aria-label="Próximas citas con desplazamiento horizontal" tabIndex={0}><table><caption className="sr-only">Hasta cinco próximas citas activas, ordenadas por fecha y hora</caption><thead><tr><th scope="col">Mascota</th><th scope="col">Atención</th><th scope="col">Fecha y hora</th><th scope="col">Estado</th><th scope="col">Detalle</th></tr></thead><tbody>{resumen.proximas.map(c=>{
          const mascota=pacientes.find(p=>String(p.id)===String(c.mascotaId))
          return <tr key={c.id}><td><strong>{mascota?.nombre || c.mascotaNombre || 'Mascota no registrada'}</strong></td><td>{c.servicio}</td><td>{formatearFecha(c.fecha)}<br /><span>{c.hora}</span></td><td><span className={`panel-state${c.estado==='Confirmada'?' panel-state--confirmed':''}`}>{c.estado}</span></td><td><Link to={`/mis-citas/${encodeURIComponent(c.id)}`}>Ver cita <span aria-hidden="true">↗</span></Link></td></tr>
        })}</tbody></table></div> : <div className="panel-empty"><span aria-hidden="true">✓</span><h3>No hay próximas citas registradas</h3><p>Las solicitudes aparecerán aquí cuando se registren.</p><Link to="/recepcion/solicitudes">Ir a solicitudes</Link></div>}
      </section>
    </div>
  )
}
