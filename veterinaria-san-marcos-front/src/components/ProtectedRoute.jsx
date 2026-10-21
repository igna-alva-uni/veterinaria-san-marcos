import { Navigate, Outlet } from 'react-router-dom'

// Control de acceso de la demostración. El backend debe autorizar sus endpoints.
export default function ProtectedRoute({ user, roles }) {
  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.rol)) {
    return <p className="layout-message" role="alert">Acceso denegado: tu rol no tiene permiso para esta vista.</p>
  }

  return <Outlet />
}
