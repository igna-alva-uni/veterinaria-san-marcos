import { describe, expect, it } from 'vitest'
import { avisosDeVacunas, fechaValida, obtenerVacunas } from './vacunas.js'
import { validarAtencion } from '../validaciones.js'

const atencion = (vencimiento, fecha = '2026-10-01', nombre = 'Vacuna antirrábica') => ({
  fecha, diagnostico: 'Control', vacuna: { nombre, vencimiento },
})
describe('Vencimientos de vacunas', () => {
  it.each([
    ['2026-10-19', 'Vencida', true], ['2026-10-20', 'Vence hoy', true],
    ['2026-11-19', 'Por vencer', true], ['2026-11-20', 'Vigente', false],
  ])('clasifica el límite %s como %s', (fecha, estado, aviso) => {
    expect(obtenerVacunas([atencion(fecha)], '2026-10-20')[0]).toMatchObject({ estado, aviso })
  })
  it('reemplaza el vencimiento anterior por la última dosis, aunque el historial esté desordenado', () => {
    const historial = [atencion('2027-09-01', '2026-10-15'), atencion('2026-10-01', '2025-10-01')]
    expect(obtenerVacunas(historial, '2026-10-20')).toEqual([expect.objectContaining({ estado: 'Vigente', fecha: '2026-10-15' })])
  })
  it('unifica nombres con espacios, mayúsculas y acentos y mantiene vacunas diferentes', () => {
    const lista = obtenerVacunas([atencion('2026-10-01'), atencion('2027-01-01', '2026-10-15', ' vacuna ANTIRRABICA '), atencion('2026-11-01', '2026-10-01', 'Vacuna óctuple')], '2026-10-20')
    expect(lista).toHaveLength(2)
    expect(lista.filter(v => v.aviso)).toHaveLength(1)
  })
  it('conserva vacunas antiguas sin inventar vencimientos ni alertas', () => {
    expect(obtenerVacunas([{fecha: '2026-01-01', tipo: 'Vacuna KC'}], '2026-10-20')[0]).toMatchObject({ estado: 'Sin vencimiento registrado', aviso: false })
    expect(obtenerVacunas([{fecha: '2026-01-01', medicamento: 'Analgésico'}])).toEqual([])
  })
  it('incluye la mascota correspondiente en cada aviso', () => {
    expect(avisosDeVacunas([{id: 9, nombre: 'Luna', historial: [atencion('2026-10-25')]}], '2026-10-20')[0]).toMatchObject({mascotaId: 9, mascotaNombre: 'Luna', estado: 'Por vencer'})
  })
  it('calcula días civiles al cruzar meses y cambios de horario', () => {
    expect(obtenerVacunas([atencion('2026-09-10')], '2026-08-31')[0].dias).toBe(10)
  })
  it.each(['2026-02-30', '2026-13-01', '', 'no-fecha'])('rechaza la fecha inexistente %s', fecha => {
    expect(fechaValida(fecha)).toBe(false)
  })
  it('exige vencimiento posterior a la aplicación y nombre para una vacuna', () => {
    expect(validarAtencion(atencion('2026-10-01'), '2026-10-20')).toMatch(/vencimiento/)
    expect(validarAtencion(atencion(''), '2026-10-20')).toMatch(/vencimiento/)
    expect(validarAtencion(atencion('2027-01-01', '2026-10-01', ''), '2026-10-20')).toMatch(/nombre/)
    expect(validarAtencion(atencion('2027-01-01'), '2026-10-20')).toBe('')
  })
})
