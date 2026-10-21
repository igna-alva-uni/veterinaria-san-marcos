// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { pacientesIniciales, usuariosIniciales } from '../datos.js'
import { obtenerMascotas, obtenerMascotaPorId, registrarMascota, actualizarMascota,
  leerPacientesCompartidos, registrarCita, obtenerCitas, obtenerCitaPorId,
  actualizarEstadoCita, reprogramarCita } from './veterinaria.js'
import { claveCompra, leerCarritoUsuario } from './compra.js'
import { productosCatalogo } from './catalogo.js'

const otro = { id: 9, nombre: 'Otro dueño', correo: 'otro@profesor.duoc.cl', rol: 'Dueño', activo: true }
function sesion(id) {
  localStorage.setItem('vet_sesion', JSON.stringify({ id }))
}
function datosCita(mascotaId = 1) {
  return { mascotaId, servicio: 'Consulta general', fecha: '2099-12-10', hora: '10:00' }
}
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('vet_usuarios', JSON.stringify([...usuariosIniciales, otro]))
  localStorage.setItem('vet_pacientes', JSON.stringify([...pacientesIniciales,
    { id: 9, nombre: 'Ajena', especie: 'Gato', edad: 2, duenoId: 9, historial: [] }]))
  sesion(3)
})

describe('Datos compartidos de las ramas', () => {
  it('separa las mascotas por dueño y rechaza identificadores de otro cliente', () => {
    expect(obtenerMascotas().map(p => p.nombre)).toEqual(['Luna', 'Michi'])
    expect(obtenerMascotaPorId(9)).toBeNull()
  })
  it('registra en la misma fuente que recepción, con dueño y edad numérica', () => {
    const resultado = registrarMascota({ nombre: 'Nube', especie: 'Gato', edad: '3 años' })
    expect(resultado.ok).toBe(true)
    expect(leerPacientesCompartidos()).toContainEqual(expect.objectContaining({ nombre: 'Nube', edad: 3, duenoId: 3, historial: [] }))
    sesion(2)
    expect(obtenerMascotas().find(p => p.nombre === 'Nube')).toBeDefined()
  })
  it('preserva los datos clínicos al editar y no permite reasignar al dueño', () => {
    expect(actualizarMascota(1, { nombre: 'Luna nueva', duenoId: 9 }).ok).toBe(true)
    const mascota = obtenerMascotaPorId(1)
    expect(mascota.duenoId).toBe(3)
    expect(mascota.edad).toBe(4)
    expect(mascota.historial).toEqual(pacientesIniciales[0].historial)
  })
  it('migra las mascotas anteriores sin duplicar pacientes ni asignarlas al usuario actual', () => {
    localStorage.setItem('vsm-mascotas', JSON.stringify([{id: 1, nombre:'Duplicada'}, {id:'legado',nombre:'Antigua',edad:'2 años'}]))
    sesion(9)
    expect(obtenerMascotaPorId('legado')).toBeNull()
    expect(leerPacientesCompartidos().filter(p => p.id === 1)).toHaveLength(1)
    sesion(3)
    expect(obtenerMascotaPorId('legado')).toMatchObject({duenoId:3,edad:2})
  })
  it('rechaza edades inválidas y registros sin sesión', () => {
    expect(registrarMascota({nombre:'Error',especie:'Gato',edad:'-3'}).ok).toBe(false)
    localStorage.removeItem('vet_sesion')
    expect(registrarMascota({nombre:'Sin sesión',especie:'Gato',edad:'3'}).ok).toBe(false)
    expect(obtenerMascotas()).toEqual([])
  })
})
describe('Solicitud y gestión de citas', () => {
  it('permite confirmar desde recepción y ver el estado desde el dueño', () => {
    const { cita } = registrarCita(datosCita())
    expect(actualizarEstadoCita(cita.id,'Confirmada').ok).toBe(false)
    sesion(2)
    expect(actualizarEstadoCita(cita.id,'Confirmada').ok).toBe(true)
    sesion(3)
    expect(obtenerCitaPorId(cita.id).estado).toBe('Confirmada')
    sesion(9)
    expect(obtenerCitas()).toEqual([])
    expect(obtenerCitaPorId(cita.id)).toBeNull()
  })
  it('impide solicitar para mascotas ajenas y ocupar el mismo horario desde otro dueño', () => {
    expect(registrarCita(datosCita(9)).ok).toBe(false)
    expect(registrarCita(datosCita()).ok).toBe(true)
    sesion(9)
    expect(registrarCita(datosCita(9)).ok).toBe(false)
  })
  it('rechaza fechas imposibles o pasadas y horarios no disponibles', () => {
    for (const campos of [{fecha:'2099-02-30'}, {fecha:'2000-01-01'}, {hora:'03:00'}]) {
      expect(registrarCita({...datosCita(), ...campos}).ok).toBe(false)
    }
  })
  it('reagenda desde recepción y mantiene pendiente la confirmación', () => {
    const {cita} = registrarCita(datosCita())
    expect(reprogramarCita(cita.id,'2099-12-11','11:00').ok).toBe(false)
    sesion(2)
    expect(reprogramarCita(cita.id,'2099-12-11','11:00').ok).toBe(true)
    expect(obtenerCitaPorId(cita.id)).toMatchObject({fecha:'2099-12-11',hora:'11:00',estado:'Pendiente de confirmación'})
  })
})
describe('Carrito por cuenta', () => {
  it('separa el carrito y los pedidos entre usuarios del mismo navegador', () => {
    const producto = productosCatalogo.find(p => p.tipo === 'producto')
    const clave = claveCompra('vsm-carrito')
    localStorage.setItem(clave, JSON.stringify([{...producto,cantidad:2}]))
    localStorage.setItem(claveCompra('vsm-pedidos'),'[{"numero":"demo"}]')
    sesion(9)
    expect(leerCarritoUsuario()).toEqual([])
    expect(localStorage.getItem(claveCompra('vsm-pedidos'))).toBeNull()
    sesion(3)
    expect(leerCarritoUsuario()[0].cantidad).toBe(2)
  })
  it('normaliza cantidades y precios usando el catálogo compartido', () => {
    const producto = productosCatalogo.find(p => p.tipo === 'producto')
    const servicio = productosCatalogo.find(p => p.tipo === 'servicio')
    localStorage.setItem(claveCompra('vsm-carrito'),JSON.stringify([{...producto,cantidad:999,precio:0},{...servicio,cantidad:5}]))
    expect(leerCarritoUsuario()).toEqual([{...producto,cantidad:producto.stock},{...servicio,cantidad:1}])
  })
  it('reserva el carrito anterior para la cuenta demostrativa y tolera JSON dañado', () => {
    const producto = productosCatalogo[0]
    localStorage.setItem('vsm-carrito',JSON.stringify([{...producto,cantidad:1}]))
    sesion(9)
    expect(leerCarritoUsuario()).toEqual([])
    sesion(3)
    expect(leerCarritoUsuario()).toHaveLength(1)
    localStorage.setItem(claveCompra('vsm-carrito'),'{roto')
    expect(leerCarritoUsuario()).toEqual([])
  })
})
