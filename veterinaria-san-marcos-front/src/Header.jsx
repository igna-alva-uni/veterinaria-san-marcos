import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'
import { mainNavigation } from './navigation.js'
import { cantidadCarritoUsuario, suscribirCarrito } from './data/compra.js'

// La sesión y las acciones se conectan desde el layout, sin simular autenticación.
function Header({
  navigation = mainNavigation,
  activePath = window.location.pathname,
  user = null,
  onLogout,
  onLogin,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)
  const cantidadCarrito = useSyncExternalStore(
    suscribirCarrito,
    () => cantidadCarritoUsuario(user?.id),
    () => 0,
  )

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  const isActive = (href) => activePath === href ||
    (href === '/inicio' && activePath === '/') || activePath.startsWith(`${href}/`)

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <div className="site-header__strip">
        <div className="site-container">Cerca de ti y de tu mascota <span>Rancagua · Desde 2009</span></div>
      </div>
      <div className="site-container site-header__inner">
        <Brand />
        <button
          ref={toggleRef}
          className="site-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
          Menú
        </button>
        <nav id="site-navigation" className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label="Navegación principal">
          <ul className="site-nav__list">
            {navigation.map(({ label, href }) => (
              <li key={href}>
                <Link to={href}
                  className={href === '/carrito' ? 'site-cart-link' : undefined}
                  aria-label={href === '/carrito' ? (cantidadCarrito ? `Carrito, ${cantidadCarrito} ${cantidadCarrito === 1 ? 'elemento' : 'elementos'}` : 'Carrito') : undefined}
                  aria-current={isActive(href) ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}>
                  {href === '/carrito' ? <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 3h2l2.5 12h11l2-8H6" />
                      <circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
                    </svg>
                    <span className={cantidadCarrito ? 'site-cart-count' : undefined} aria-hidden="true">{cantidadCarrito || 'Carrito'}</span>
                  </> : label}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="site-session">
              <Link className="site-profile-link" to="/perfil"
                aria-label={`Ver perfil de ${user.name}`}
                title={`Mi perfil · ${user.name}`}
                aria-current={isActive('/perfil') ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                </svg>
              </Link>
              {onLogout && <button className="site-button site-button--secondary" type="button" onClick={() => { setMenuOpen(false); onLogout() }}>Cerrar sesión</button>}
            </div>
          ) : onLogin && (
            <button className="site-button" type="button" onClick={() => { setMenuOpen(false); onLogin() }}>Iniciar sesión <span aria-hidden="true">→</span></button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
