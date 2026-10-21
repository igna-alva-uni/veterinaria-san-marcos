import { Outlet } from 'react-router-dom'

// Conserva separados los estilos de los módulos que se integraron de cada rama.
export default function ContentLayout({ variant = 'standard' }) {
  return (
    <div className={variant === 'feature' ? 'feature-module' : 'vet-module'}>
      <Outlet />
    </div>
  )
}
