import { Link } from 'react-router-dom'
import { serviciosCatalogo } from '../../data/catalogo.js'
import { clinica } from '../../data/clinica.js'
import logo from '../../assets/logo.jpeg'
import ServicioCard from './ServicioCard.jsx'
import AvisosVacunas from '../../components/AvisosVacunas.jsx'
import './ClinicaPages.css'

const accesosPorRol = {
  Dueño: [
    { titulo: 'Solicitar una cita', detalle: 'Elige tu mascota, el servicio y un horario disponible.', ruta: '/citas/nueva', simbolo: '+' },
    { titulo: 'Mis mascotas', detalle: 'Organiza sus datos y consulta sus fichas.', ruta: '/mascotas', simbolo: '♡' },
    { titulo: 'Mis citas', detalle: 'Revisa tus solicitudes y su estado de confirmación.', ruta: '/mis-citas', simbolo: '✓' },
  ],
  Recepcionista: [
    { titulo: 'Solicitudes de citas', detalle: 'Confirma, cancela o propone otro horario.', ruta: '/recepcion/solicitudes', simbolo: '✓' },
    { titulo: 'Pacientes', detalle: 'Registra mascotas y actualiza sus fichas clínicas.', ruta: '/recepcion/pacientes', simbolo: '+' },
    { titulo: 'Mi perfil', detalle: 'Mantén tus datos personales actualizados.', ruta: '/perfil', simbolo: '↗' },
  ],
  Administrador: [
    { titulo: 'Gestionar usuarios', detalle: 'Administra cuentas, roles y estados de acceso.', ruta: '/admin/usuarios', simbolo: '+' },
    { titulo: 'Reportes', detalle: 'Consulta las atenciones registradas por período.', ruta: '/admin/reportes', simbolo: '↗' },
    { titulo: 'Solicitudes de citas', detalle: 'Revisa y coordina las solicitudes de atención.', ruta: '/recepcion/solicitudes', simbolo: '✓' },
  ],
}
const destacados = ['SV001', 'SV004', 'SV008', 'SV028']

export default function InicioPage({ usuario, pacientes = [] }) {
  const accesos = accesosPorRol[usuario.rol] || []
  const principal = usuario.rol === 'Administrador' ? {ruta:'/admin',titulo:'Abrir administración'}
    : usuario.rol === 'Recepcionista' ? {ruta:'/recepcion',titulo:'Abrir recepción'}
    : accesos[0]
  return (
    <div className="clinic-page">
      <section className="clinic-hero clinic-home-hero">
        <div>
          <span className="clinic-eyebrow">Rancagua · Desde {clinica.fundadaEn}</span>
          <h1>Cuidamos a quienes<br />son parte de tu familia.</h1>
          <p>En Veterinaria San Marcos acompañamos el bienestar de perros, gatos, conejos y aves con atención cercana y una historia clínica organizada.</p>
          <div className="clinic-actions">
            <Link className="site-button" to={principal?.ruta || '/perfil'}>{principal?.titulo || 'Ver mi perfil'} <span aria-hidden="true">→</span></Link>
            <Link className="clinic-text-link" to="/servicios">Conocer los servicios</Link>
          </div>
        </div>
        <div className="clinic-hero-brand" aria-hidden="true">
          <img src={logo} alt="" width="220" height="220" />
          <span className="clinic-brand-caption">San Marcos</span>
          <span>Salud y bienestar animal</span>
        </div>
      </section>
      <AvisosVacunas pacientes={pacientes} usuario={usuario} />
      <section className="clinic-section" aria-labelledby="accesos-titulo">
        <div className="clinic-section-heading"><div><span className="clinic-eyebrow">Tu espacio · {usuario.rol}</span><h2 id="accesos-titulo">Hola, {usuario.nombre}. ¿Qué necesitas hoy?</h2></div></div>
        <div className="clinic-grid clinic-grid--three">
          {accesos.map(acceso => <Link className="clinic-shortcut" to={acceso.ruta} key={acceso.ruta}>
            <span className="clinic-shortcut-icon" aria-hidden="true">{acceso.simbolo}</span><h3>{acceso.titulo}</h3><p>{acceso.detalle}</p><span className="clinic-text-link">Ir a esta sección <span aria-hidden="true">↗</span></span>
          </Link>)}
        </div>
      </section>
      <section className="clinic-section" aria-labelledby="destacados-titulo">
        <div className="clinic-section-heading"><div><span className="clinic-eyebrow">Acompañamos cada etapa</span><h2 id="destacados-titulo">Servicios destacados</h2></div><Link className="clinic-text-link" to="/servicios">Ver todos los servicios <span aria-hidden="true">→</span></Link></div>
        <div className="clinic-grid clinic-grid--services">{destacados.map(codigo => <ServicioCard key={codigo} servicio={serviciosCatalogo.find(s=>s.codigo===codigo)} rol={usuario.rol} />)}</div>
        <p className="clinic-note">Las solicitudes de atención requieren confirmación de la clínica.</p>
      </section>
      <section className="clinic-about">
        <div><span className="clinic-eyebrow">Nuestra clínica</span><h2>Atención cercana, información a mano.</h2><p>Desde 2009, San Marcos atiende mascotas domésticas en Rancagua. Nuestra plataforma reúne sus datos, solicitudes de citas y antecedentes de atención para facilitar la coordinación con recepción.</p></div>
        <div className="clinic-about-location"><span aria-hidden="true">↗</span><h3>Estamos en Rancagua</h3><p>{clinica.region}</p><Link className="clinic-text-link" to="/ubicacion">Consultar ubicación</Link></div>
      </section>
    </div>
  )
}
