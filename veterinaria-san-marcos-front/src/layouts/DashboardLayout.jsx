import { NavLink, Outlet } from 'react-router-dom'

// Se anida dentro de MainLayout: no vuelve a crear Header, Footer ni main.
export default function DashboardLayout({ title, homePath }) {
  return (
    <section className="dashboard-layout" aria-label={title}>
      <div className="dashboard-layout__heading">
        <span className="dashboard-layout__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </span>
        <p>{title}</p>
        <NavLink className="dashboard-layout__home" to={homePath} end>Resumen del panel <span aria-hidden="true">↗</span></NavLink>
      </div>
      <Outlet />
    </section>
  )
}
