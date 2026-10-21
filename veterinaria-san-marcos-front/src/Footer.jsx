import Brand from './Brand.jsx'
import { Link } from 'react-router-dom'
import { mainNavigation } from './navigation.js'

function Footer({ navigation = mainNavigation, contact = {} }) {
  const { address, phone, email, hours } = contact
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__grid">
        <div className="site-footer__about">
          <Brand compact />
          <p>Acompañamos el bienestar de tu mascota en cada etapa de su vida.</p>
          <span className="site-footer__badge">En Rancagua desde 2009</span>
        </div>
        <nav className="site-footer__section" aria-label="Enlaces del pie de página">
          <h2>Explora</h2>
          <ul>
            {navigation.map(({ label, href }) => <li key={href}><Link to={href}>{label}</Link></li>)}
          </ul>
        </nav>
        <div className="site-footer__section">
          <h2>Encuéntranos</h2>
          <address>
            <p>{address || 'Rancagua, Región de O’Higgins'}</p>
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>}
            {email && <a href={`mailto:${email}`}>{email}</a>}
          </address>
          {hours && <p className="site-footer__hours">{hours}</p>}
          <Link className="site-footer__location" to="/ubicacion">Ver ubicación <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="site-container site-footer__bottom">
        <small>© {new Date().getFullYear()} Veterinaria San Marcos. Todos los derechos reservados.</small>
        <a href="#contenido">Volver arriba <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  )
}

export default Footer
