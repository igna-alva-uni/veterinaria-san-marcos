// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import App from '../../App.jsx'
import { usuariosIniciales, pacientesIniciales } from '../../datos.js'
import { fechaLocal } from '../../data/panel.js'

afterEach(cleanup)
beforeEach(() => { cleanup(); localStorage.clear() })
function abrir(ruta, rol = 'Administrador', pacientes = pacientesIniciales) {
  localStorage.setItem('vet_sesion', JSON.stringify(usuariosIniciales.find(u => u.rol === rol)))
  localStorage.setItem('vet_usuarios', JSON.stringify(usuariosIniciales))
  localStorage.setItem('vet_pacientes', JSON.stringify(pacientes))
  window.history.replaceState({}, '', ruta)
  return render(<App />)
}
const cambiar = (nombre, value) => fireEvent.change(screen.getByLabelText(nombre, {exact: true}), {target: {value}})
const guardar = () => fireEvent.click(screen.getByRole('button', {name: 'Guardar', exact: true}))
const leerUsuarios = () => JSON.parse(localStorage.getItem('vet_usuarios'))
function completarUsuario(rol, correo) {
  cambiar('Nombre', 'Nueva cuenta')
  cambiar('Rol', rol)
  cambiar('Correo', correo)
  cambiar('Contraseña', 'NuevaClave123')
}
describe('Administración de usuarios con roles', () => {
  it.each([['Administrador', 'otra@duocuc.cl'], ['Recepcionista', 'otra@gmail.com'], ['Dueño', 'otra@profesor.duoc.cl']])('crea y permite ingresar a una cuenta %s', (rol, correo) => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Crear usuario'}))
    completarUsuario(rol, correo)
    guardar()
    expect(leerUsuarios().find(u => u.correo === correo)).toMatchObject({rol, activo: true})
    fireEvent.click(screen.getByRole('button', {name: 'Cerrar sesión'}))
    cambiar('Correo electrónico', correo)
    cambiar('Contraseña', 'NuevaClave123')
    fireEvent.click(screen.getByRole('button', {name: 'Ingresar'}))
    expect(window.location.pathname).toBe(rol === 'Administrador' ? '/admin' : rol === 'Recepcionista' ? '/recepcion' : '/inicio')
  })
  it('rechaza un dominio incompatible sin crear la cuenta', () => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Crear usuario'}))
    completarUsuario('Administrador', 'otra@gmail.com')
    guardar()
    expect(screen.getByRole('alert')).toHaveTextContent('@duocuc.cl')
    expect(leerUsuarios()).toHaveLength(3)
  })
  it('rechaza correos duplicados sin distinguir mayúsculas o espacios', () => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Crear usuario'}))
    completarUsuario('Administrador', 'ADMIN@duocuc.cl ')
    guardar()
    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe')
    expect(leerUsuarios()).toHaveLength(3)
  })
  it('guarda el nuevo rol y correo juntos, conserva contraseña y permite ingresar', () => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Editar usuario Recepción'}))
    cambiar('Rol', 'Administrador')
    guardar()
    expect(screen.getByRole('alert')).toHaveTextContent('@duocuc.cl')
    expect(leerUsuarios()[1].rol).toBe('Recepcionista')
    cambiar('Correo', 'equipo@duocuc.cl')
    guardar()
    expect(leerUsuarios()[1]).toMatchObject({rol: 'Administrador', correo: 'equipo@duocuc.cl', clave: 'Recepcion123'})
    fireEvent.click(screen.getByRole('button', {name: 'Cerrar sesión'}))
    cambiar('Correo electrónico', 'equipo@duocuc.cl')
    cambiar('Contraseña', 'Recepcion123')
    fireEvent.click(screen.getByRole('button', {name: 'Ingresar'}))
    expect(window.location.pathname).toBe('/admin')
  })
  it('protege el rol y estado de la cuenta que está administrando', () => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Editar usuario Administración'}))
    expect(screen.getByLabelText('Rol')).toBeDisabled()
    const fila = screen.getByRole('row', {name: /admin@duocuc.cl/})
    expect(within(fila).getByRole('button', {name: 'Desactivar'})).toBeDisabled()
    expect(within(fila).getByRole('button', {name: 'Eliminar cliente'})).toBeDisabled()
  })
  it('cancelar una edición no cambia los datos', () => {
    abrir('/admin/usuarios')
    fireEvent.click(screen.getByRole('button', {name: 'Editar usuario Recepción'}))
    cambiar('Correo', 'sin-guardar@gmail.com')
    fireEvent.click(within(screen.getByRole('form', {name: 'Editar usuario'})).getByRole('button', {name: 'Cancelar edición'}))
    expect(leerUsuarios()[1].correo).toBe('recepcion@gmail.com')
  })
})

const registro = {id: 'atencion-vacuna', fecha: '2026-01-10', tipo: 'Consulta general', diagnostico: 'Paciente estable', medicamento: 'Tratamiento registrado', observacion: 'Reposo', proximoControl: '2026-12-10', vacuna: {nombre: 'Vacuna antirrábica', vencimiento: fechaLocal()}}
const mascotas = [{...pacientesIniciales[0], historial: [registro]}, {...pacientesIniciales[1], duenoId: 99, nombre: 'Mascota privada', historial: [{...registro, diagnostico: 'Dato confidencial', vacuna: {nombre: 'Vacuna privada', vencimiento: fechaLocal()}}]}]
describe('Historial y vacunación del cliente', () => {
  it('muestra diagnósticos, tratamiento, indicaciones, próximo control y vacunas en su ficha', () => {
    abrir('/mascotas/1', 'Dueño', mascotas)
    const historial = screen.getByRole('region', {name: 'Historial clínico'})
    for (const texto of ['Paciente estable', 'Tratamiento registrado', 'Reposo', '2026-12-10']) expect(within(historial).getByText(texto, {exact: false})).toBeInTheDocument()
    expect(screen.getByText('Vence hoy')).toBeInTheDocument()
    expect(within(historial).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('Dato confidencial')).not.toBeInTheDocument()
  })
  it('rechaza el acceso directo a una ficha de otro dueño', () => {
    abrir('/mascotas/2', 'Dueño', mascotas)
    expect(screen.getByRole('heading', {name: 'Mascota no encontrada'})).toBeInTheDocument()
    expect(screen.queryByText('Dato confidencial')).not.toBeInTheDocument()
    expect(screen.queryByText('Vacuna privada')).not.toBeInTheDocument()
  })
  it('Inicio avisa solo por las mascotas propias y enlaza su historial', () => {
    abrir('/inicio', 'Dueño', mascotas)
    const avisos = screen.getByRole('region', {name: 'Avisos de vacunas'})
    expect(within(avisos).getByText('Vence hoy')).toBeInTheDocument()
    expect(within(avisos).queryByText(/Vacuna privada/)).not.toBeInTheDocument()
    fireEvent.click(within(avisos).getByRole('link', {name: 'Ver historial de Luna'}))
    expect(window.location.pathname).toBe('/mascotas/1')
    expect(screen.getByRole('heading', {name: 'Historial clínico'})).toBeInTheDocument()
  })
  it('muestra estados vacíos cuando no existen atenciones ni vacunas', () => {
    abrir('/mascotas/2', 'Dueño')
    expect(screen.getByText('No hay atenciones registradas.')).toBeInTheDocument()
    expect(screen.getByText('No hay vacunas registradas.')).toBeInTheDocument()
  })
  it('recibe en la ficha del cliente una vacuna registrada por recepción y persiste tras recargar', () => {
    const vista = abrir('/recepcion/pacientes/1', 'Recepcionista')
    cambiar('Fecha', '2026-01-10')
    cambiar('Diagnóstico', 'Vacunación completada')
    cambiar('Nombre de la vacuna', 'Vacuna óctuple')
    cambiar('Vencimiento de la vacuna', fechaLocal())
    fireEvent.click(screen.getByRole('button', {name: 'Guardar atención'}))
    const guardados = JSON.parse(localStorage.getItem('vet_pacientes'))
    expect(guardados[0].historial.at(-1)).toMatchObject({vacuna: {nombre: 'Vacuna óctuple', vencimiento: fechaLocal()}})
    vista.unmount()
    abrir('/inicio', 'Dueño', guardados)
    expect(screen.getByText('Luna · Vacuna óctuple')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', {name: 'Ver historial de Luna'}))
    expect(screen.getByText('Vacunación completada', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('Vence hoy')).toBeInTheDocument()
  })
})
