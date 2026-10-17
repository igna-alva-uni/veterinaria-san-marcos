import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import MascotasPage from './features/mascotas/MascotasPage.jsx'
import DetalleMascotaPage from './features/mascotas/DetalleMascotaPage.jsx'
import CatalogoPage from './catalogo/CatalogoPage.jsx'
import CarritoPage from './catalogo/CarritoPage.jsx'
import SolicitarCitaPage from './features/citas/SolicitarCitaPage.jsx'
import MisCitasPage from './features/citas/MisCitasPage.jsx'
import DetalleCitaPage from './features/citas/DetalleCitaPage.jsx'
import RecepcionSolicitudesPage from './features/citas/RecepcionSolicitudesPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/mascotas" replace />} />

        <Route path="/mascotas" element={<MascotasPage />} />
        <Route path="/mascotas/:id" element={<DetalleMascotaPage />} />

        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/carrito" element={<CarritoPage />} />

        <Route path="/citas/nueva" element={<SolicitarCitaPage />} />
        <Route path="/mis-citas" element={<MisCitasPage />} />
        <Route path="/mis-citas/:id" element={<DetalleCitaPage />} />

        <Route
          path="/recepcion/solicitudes"
          element={<RecepcionSolicitudesPage />}
        />

        <Route path="*" element={<Navigate to="/mascotas" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App