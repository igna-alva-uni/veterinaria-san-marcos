import { Navigate, Outlet } from 'react-router-dom'

// Control de acceso en la interfaz (IE3.3.3): oculta vistas según el rol del usuario.
// Es solo experiencia de usuario: cada microservicio vuelve a validar el JWT y el rol (403).
export default function ProtectedRoute({ user, roles }) {
  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.rol)) {
    return <p className="layout-message" role="alert">Acceso denegado: tu rol no tiene permiso para esta vista.</p>
  }

  return <Outlet />
}
