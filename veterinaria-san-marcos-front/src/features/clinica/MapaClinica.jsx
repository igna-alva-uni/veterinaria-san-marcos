import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

export default function MapaClinica({ ubicacion, confirmada }) {
  const contenedor = useRef(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let activo = true
    let mapa
    let observador
    import('leaflet').then(({ default: L }) => {
      if (!activo || !contenedor.current) return
      mapa = L.map(contenedor.current, { scrollWheelZoom: false }).setView(
        confirmada ? ubicacion.coordenadas : ubicacion.centroCiudad, confirmada ? 16 : 13,
      )
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapa)
      tiles.on('tileerror', () => { if (activo) setError('No se pudieron cargar algunas partes del mapa. Revisa tu conexión a internet.') })
      if (confirmada) L.circleMarker(ubicacion.coordenadas, { radius: 11, color: '#123052', fillColor: '#ffb52b', fillOpacity: 1, weight: 3 }).addTo(mapa).bindPopup(ubicacion.nombre)
      if (typeof ResizeObserver !== 'undefined') {
        observador = new ResizeObserver(() => mapa.invalidateSize())
        observador.observe(contenedor.current)
      }
    }).catch(() => { if (activo) setError('No fue posible iniciar el mapa. Inténtalo nuevamente más tarde.') })
    return () => { activo = false; observador?.disconnect(); mapa?.remove() }
  }, [ubicacion, confirmada])
  return <div><div ref={contenedor} className="clinic-map" role="region" aria-label={confirmada?'Mapa de la ubicación de la clínica':'Mapa general de Rancagua; ubicación de la clínica pendiente'} />{error && <p role="status" className="clinic-note">{error}</p>}</div>
}
