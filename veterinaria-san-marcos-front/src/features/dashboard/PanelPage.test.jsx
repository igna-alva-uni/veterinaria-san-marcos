// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import PanelPage from './PanelPage.jsx'
import { fechaLocal, resumirPanel } from '../../data/panel.js'

afterEach(cleanup)
beforeEach(()=>localStorage.clear())
const usuarios=[{id:1,nombre:'Admin',rol:'Administrador',activo:true},{id:2,nombre:'Recepción',rol:'Recepcionista',activo:true},{id:3,nombre:'Cliente',rol:'Dueño',activo:false}]
const pacientes=[{id:1,nombre:'Luna',historial:[{fecha:'2026-10-10'}]},{id:2,nombre:'Michi',historial:[]}]
function abrir(tipo='admin') { return render(<MemoryRouter><PanelPage tipo={tipo} usuario={usuarios[tipo==='admin'?0:1]} usuarios={usuarios} pacientes={pacientes} /></MemoryRouter>) }
function citas(hoy='2026-10-20') {
  return [
    {id:'pendiente',mascotaId:1,servicio:'Consulta general',fecha:hoy,hora:'11:00',estado:'Pendiente de confirmación'},
    {id:'confirmada',mascotaId:2,servicio:'Vacunación',fecha:hoy,hora:'09:00',estado:'Confirmada'},
    {id:'cancelada',mascotaId:1,servicio:'Consulta general',fecha:hoy,hora:'10:00',estado:'Cancelada'},
    {id:'antigua',mascotaId:1,servicio:'Control',fecha:'2020-01-01',hora:'09:00',estado:'Confirmada'},
  ]
}
describe('Resumen de administración y recepción',()=>{
  it('calcula los indicadores y ordena la agenda excluyendo canceladas y fechas pasadas',()=>{
    const resumen=resumirPanel(usuarios,pacientes,citas(),'2026-10-20')
    expect(resumen).toMatchObject({usuariosActivos:2,pacientes:2,atenciones:1,pendientes:1,citasHoy:2,confirmadasHoy:1})
    expect(resumen.proximas.map(c=>c.id)).toEqual(['confirmada','pendiente'])
  })
  it('muestra accesos de administración y métricas de los registros',()=>{
    abrir()
    expect(screen.getByRole('heading',{name:'Resumen de administración'})).toBeInTheDocument()
    expect(screen.getByRole('heading',{name:'Usuarios'}).closest('a')).toHaveAttribute('href','/admin/usuarios')
    const metricas=screen.getByRole('region',{name:'Indicadores del panel'})
    expect(within(within(metricas).getByRole('link',{name:/Usuarios activos/})).getByText('2')).toBeInTheDocument()
    expect(within(within(metricas).getByRole('link',{name:/Atenciones registradas/})).getByText('1')).toBeInTheDocument()
  })
  it('presenta las citas del día en recepción sin accesos a usuarios',()=>{
    localStorage.setItem('vsm-citas',JSON.stringify(citas(fechaLocal())))
    abrir('recepcion')
    expect(screen.getByRole('heading',{name:'Resumen de recepción'})).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Usuarios'})).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByRole('link',{name:/Solicitudes de citas Confirma/})).toHaveAttribute('href','/recepcion/solicitudes')
  })
  it('actualiza las métricas cuando cambia el estado de una cita',()=>{
    localStorage.setItem('vsm-citas',JSON.stringify(citas(fechaLocal())))
    abrir('recepcion')
    const metricas=screen.getByRole('region',{name:'Indicadores del panel'})
    const confirmadas=within(metricas).getByRole('link',{name:/Confirmadas hoy/})
    expect(within(confirmadas).getByText('1')).toBeInTheDocument()
    act(()=>{
      localStorage.setItem('vsm-citas',JSON.stringify(citas(fechaLocal()).map(c=>({...c,estado:c.id==='pendiente'?'Confirmada':c.estado}))))
      window.dispatchEvent(new Event('vet:citas'))
    })
    expect(within(confirmadas).getByText('2')).toBeInTheDocument()
  })
  it('muestra un estado vacío y tolera almacenamiento dañado',()=>{
    localStorage.setItem('vsm-citas','{roto')
    abrir()
    expect(screen.getByRole('heading',{name:'No hay próximas citas registradas'})).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
