import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar-veterinaria">
      <NavLink
        to="/mascotas"
        className="navbar-marca"
        aria-label="San Marcos Centro Veterinario - Inicio"
      >
        <img
          src="/logo-san-marcos.png"
          alt="Logo de San Marcos Centro Veterinario"
          className="navbar-logo-imagen"
        />

        <span className="navbar-marca-texto">
          <strong>San Marcos</strong>
          <small>Centro Veterinario</small>
          <span className="navbar-eslogan">
            Cuidamos a quienes te acompañan
          </span>
        </span>
      </NavLink>

      <nav className="navbar-enlaces" aria-label="Navegación principal">
        <NavLink
          to="/mascotas"
          end
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Mis mascotas
        </NavLink>

        <NavLink
          to="/catalogo"
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Catálogo
        </NavLink>

        <NavLink
          to="/carrito"
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Carrito
        </NavLink>

        <NavLink
          to="/citas/nueva"
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Solicitar cita
        </NavLink>

        <NavLink
          to="/mis-citas"
          end
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Mis citas
        </NavLink>

        <NavLink
          to="/recepcion/solicitudes"
          className={({ isActive }) =>
            isActive ? 'navbar-enlace activo' : 'navbar-enlace'
          }
        >
          Recepción
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar