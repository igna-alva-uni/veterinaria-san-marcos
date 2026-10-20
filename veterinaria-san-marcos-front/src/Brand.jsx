import { Link } from 'react-router-dom'
import logo from './assets/logo.jpeg'

function Brand({ compact = false }) {
  return (
    <Link className="site-brand" to="/inicio" aria-label="Veterinaria San Marcos, inicio">
      <span className="site-brand__mark" aria-hidden="true">
        <img src={logo} alt="" width="64" height="64" />
      </span>
      <span className="site-brand__text">
        <span className="site-brand__eyebrow">Veterinaria</span>
        <span className="site-brand__name">San Marcos</span>
        {!compact && <span className="site-brand__tagline">Cuidamos a quienes más quieres</span>}
      </span>
    </Link>
  )
}

export default Brand
