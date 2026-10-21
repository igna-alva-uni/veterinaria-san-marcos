import { Outlet } from 'react-router-dom'

export default function AuthLayout({ message }) {
  return (
    <main id="contenido" className="site-container site-main auth-module" tabIndex={-1}>
      <div className="vet-module">
        {message && <div role="alert" className="layout-message">{message}</div>}
        <Outlet />
      </div>
    </main>
  )
}
