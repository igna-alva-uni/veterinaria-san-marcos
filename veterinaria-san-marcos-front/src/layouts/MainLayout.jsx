import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header.jsx'
import Footer from '../Footer.jsx'

export default function MainLayout({ navigation, user, onLogin, onLogout, message }) {
  const { pathname } = useLocation()

  return (
    <>
      <Header navigation={navigation} activePath={pathname}
        user={user} onLogin={onLogin} onLogout={onLogout} />
      <main id="contenido" className="site-container site-main" tabIndex={-1}>
        {message && <div role="alert" className="layout-message">{message}</div>}
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
