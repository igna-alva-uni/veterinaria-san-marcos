import { describe, it, expect } from 'vitest'
import { productosCatalogo } from './catalogo'

describe('Catálogo de Veterinaria San Marcos', () => {
  it('1. El catálogo es un arreglo', () => {
    expect(Array.isArray(productosCatalogo)).toBe(true)
  })

  it('2. El catálogo contiene elementos', () => {
    expect(productosCatalogo.length).toBeGreaterThan(0)
  })

  it('3. Todos los elementos tienen nombre', () => {
    expect(productosCatalogo.every((item) => item.nombre?.trim())).toBe(true)
  })

  it('4. Todos los elementos tienen precio válido', () => {
    expect(
      productosCatalogo.every(
        (item) => typeof item.precio === 'number' && item.precio >= 0,
      ),
    ).toBe(true)
  })

  it('5. Todos los elementos tienen código', () => {
    expect(productosCatalogo.every((item) => item.codigo?.trim())).toBe(true)
  })

  it('6. No hay códigos duplicados', () => {
    const codigos = productosCatalogo.map((item) => item.codigo)
    expect(new Set(codigos).size).toBe(codigos.length)
  })

  it('7. Todos los elementos tienen categoría', () => {
    expect(productosCatalogo.every((item) => item.categoria?.trim())).toBe(true)
  })

  it('8. Todos tienen un tipo válido', () => {
    expect(
      productosCatalogo.every(
        (item) => item.tipo === 'producto' || item.tipo === 'servicio',
      ),
    ).toBe(true)
  })

  it('9. Los productos tienen stock válido', () => {
    const productos = productosCatalogo.filter((item) => item.tipo === 'producto')
    expect(productos.every((item) => Number.isFinite(item.stock) && item.stock >= 0)).toBe(true)
  })

  it('10. Los servicios tienen duración definida', () => {
    const servicios = productosCatalogo.filter((item) => item.tipo === 'servicio')
    expect(servicios.length).toBeGreaterThan(0)
    expect(servicios.every((item) => item.duracion?.trim())).toBe(true)
  })
})