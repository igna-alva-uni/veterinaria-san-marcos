import { useEffect, useRef, useState } from 'react'
import Brand from './Brand.jsx'
import { mainNavigation } from './navigation.js'

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
                <a href={href} aria-current={isActive(href) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="site-session">
              <span className="site-session__name">{user.name}</span>
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
