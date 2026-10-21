import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriasServicios, serviciosCatalogo } from '../../data/catalogo.js'
import ServicioCard from './ServicioCard.jsx'
import './ClinicaPages.css'

const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function ServiciosPage({ usuario }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [orden, setOrden] = useState('nombre')
  const servicios = useMemo(() => serviciosCatalogo.filter(s =>
    (categoria === 'Todas' || s.categoria === categoria) && normalizar(`${s.nombre} ${s.categoria} ${s.especie}`).includes(normalizar(busqueda.trim()))
  ).sort((a,b) => orden === 'precio' ? a.precio-b.precio : a.nombre.localeCompare(b.nombre,'es')), [busqueda,categoria,orden])
  function limpiar() { setBusqueda(''); setCategoria('Todas'); setOrden('nombre') }
  return (
    <div className="clinic-page">
      <section className="clinic-hero"><span className="clinic-eyebrow">Atención para tu mascota</span><h1>Servicios veterinarios</h1><p>Encuentra la atención que necesitas, consulta su duración y revisa los precios del catálogo.</p><Link className="clinic-text-link" to="/catalogo">Ver también productos y medicamentos <span aria-hidden="true">↗</span></Link></section>
      <section className="clinic-section" aria-label="Explorar servicios">
        <div className="clinic-filters">
          <label>Buscar servicio<input type="search" placeholder="Consulta, vacuna, especie…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} /></label>
          <label>Categoría<select value={categoria} onChange={e=>setCategoria(e.target.value)}><option>Todas</option>{categoriasServicios.map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Ordenar por<select value={orden} onChange={e=>setOrden(e.target.value)}><option value="nombre">Nombre</option><option value="precio">Menor precio</option></select></label>
        </div>
        <div className="clinic-results"><p role="status">{servicios.length} {servicios.length===1?'servicio disponible':'servicios disponibles'}</p><button type="button" className="clinic-clear" onClick={limpiar}>Limpiar filtros</button></div>
        {servicios.length ? <div className="clinic-grid clinic-grid--services">{servicios.map(s=><ServicioCard key={s.codigo} servicio={s} rol={usuario.rol} />)}</div> : <div className="clinic-empty"><h2>No encontramos servicios</h2><p>Prueba otro término o selecciona otra categoría.</p><button className="site-button" onClick={limpiar}>Mostrar todos</button></div>}
        <p className="clinic-note">Valores en pesos chilenos. La atención queda sujeta a evaluación y confirmación de la clínica.</p>
      </section>
      <section className="clinic-about"><div><span className="clinic-eyebrow">Así funciona</span><h2>De la solicitud a la atención</h2><ol className="clinic-steps"><li>Registra a tu mascota y selecciona un servicio.</li><li>Solicita una fecha y un horario.</li><li>Recepción confirma la cita o propone otro horario.</li></ol></div><Link className="site-button" to={usuario.rol==='Dueño'?'/citas/nueva':'/recepcion/solicitudes'}>{usuario.rol==='Dueño'?'Solicitar una cita':'Revisar solicitudes'} <span aria-hidden="true">→</span></Link></section>
    </div>
  )
}
