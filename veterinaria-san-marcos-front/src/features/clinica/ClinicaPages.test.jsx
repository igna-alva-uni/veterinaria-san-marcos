// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import InicioPage from './InicioPage.jsx'
import ServiciosPage from './ServiciosPage.jsx'
import UbicacionPage from './UbicacionPage.jsx'
import SolicitarCitaPage from '../citas/SolicitarCitaPage.jsx'
import { serviciosCatalogo } from '../../data/catalogo.js'
import { clinica, ubicacionConfirmada } from '../../data/clinica.js'

vi.mock('./MapaClinica.jsx', () => ({ default: ({confirmada}) => <div aria-label={confirmada?'Mapa de la clínica':'Mapa general de Rancagua'} /> }))
afterEach(cleanup)
beforeEach(() => localStorage.clear())
const dueno = {id:3,nombre:'Cliente',rol:'Dueño'}
function mostrar(element) { return render(<MemoryRouter>{element}</MemoryRouter>) }

describe('Inicio según el rol', () => {
  it.each([
    ['Dueño','Mis mascotas','Gestionar usuarios'],
    ['Recepcionista','Pacientes','Gestionar usuarios'],
    ['Administrador','Gestionar usuarios','Mis mascotas'],
  ])('muestra los accesos correspondientes a %s', (rol,permitido,ajeno) => {
    mostrar(<InicioPage usuario={{...dueno,rol}} />)
    const accesos=screen.getByRole('region',{name:/Hola, Cliente/})
    expect(within(accesos).getByRole('heading',{name:permitido})).toBeInTheDocument()
    expect(within(accesos).queryByRole('heading',{name:ajeno})).not.toBeInTheDocument()
  })
})
describe('Servicios compartidos con el catálogo', () => {
  it('filtra por búsqueda sin tildes y categoría, y permite restablecer', () => {
    mostrar(<ServiciosPage usuario={dueno} />)
    expect(screen.getAllByRole('article')).toHaveLength(serviciosCatalogo.length)
    fireEvent.change(screen.getByLabelText('Buscar servicio'),{target:{value:'antirrabica'}})
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading',{name:'Vacuna antirrábica'})).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Categoría'),{target:{value:'Cirugía'}})
    expect(screen.getByRole('heading',{name:'No encontramos servicios'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Mostrar todos'}))
    expect(screen.getAllByRole('article')).toHaveLength(serviciosCatalogo.length)
  })
  it('ordena por el precio del catálogo y conserva el servicio en el enlace de cita', () => {
    mostrar(<ServiciosPage usuario={dueno} />)
    fireEvent.change(screen.getByLabelText('Ordenar por'),{target:{value:'precio'}})
    const primero=[...serviciosCatalogo].sort((a,b)=>a.precio-b.precio)[0]
    const card=screen.getAllByRole('article')[0]
    expect(within(card).getByRole('heading',{name:primero.nombre})).toBeInTheDocument()
    expect(within(card).getByRole('link')).toHaveAttribute('href',`/citas/nueva?servicio=${primero.codigo}`)
  })
  it('abre una cita con el servicio seleccionado desde la URL', () => {
    localStorage.setItem('vet_sesion', JSON.stringify({id:3}))
    render(<MemoryRouter initialEntries={['/citas/nueva?servicio=SV004']}><Routes><Route path="/citas/nueva" element={<SolicitarCitaPage />} /></Routes></MemoryRouter>)
    expect(screen.getByLabelText(/Servicio veterinario/)).toHaveValue('Vacuna antirrábica')
  })
})
describe('Ubicación confirmada y pendiente', () => {
  it('no inventa dirección ni indicaciones si faltan datos', () => {
    mostrar(<UbicacionPage ubicacion={{...clinica,direccion:null,coordenadas:null}} />)
    expect(screen.getByRole('status')).toHaveTextContent('Dirección exacta pendiente')
    expect(screen.getByLabelText('Mapa general de Rancagua')).toBeInTheDocument()
    expect(screen.queryByRole('link',{name:/Cómo llegar/})).not.toBeInTheDocument()
  })
  it('conecta las indicaciones con el destino confirmado', () => {
    const datos={...clinica,esDemostracion:false,direccion:'Dirección de prueba 123',coordenadas:[-34.17,-70.74]}
    mostrar(<UbicacionPage ubicacion={datos} />)
    expect(screen.getByText(datos.direccion)).toBeInTheDocument()
    expect(screen.getByRole('link',{name:/Cómo llegar/})).toHaveAttribute('href','https://www.google.com/maps/dir/?api=1&destination=Direcci%C3%B3n%20de%20prueba%20123')
    expect(screen.getByLabelText('Mapa de la clínica')).toBeInTheDocument()
  })
  it('rechaza coordenadas incompletas o fuera de rango', () => {
    expect(ubicacionConfirmada({...clinica,direccion:'Prueba',coordenadas:[999,0]})).toBe(false)
    expect(ubicacionConfirmada({...clinica,direccion:'Prueba',coordenadas:[0]})).toBe(false)
  })
})
