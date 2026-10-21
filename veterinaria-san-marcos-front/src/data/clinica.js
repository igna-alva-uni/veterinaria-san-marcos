// Dirección real elegida por el equipo como referencia del caso académico.
// Corresponde a la Municipalidad, no a una sede real de la veterinaria.
export const clinica = {
  nombre: 'Veterinaria San Marcos',
  ciudad: 'Rancagua',
  region: 'Región de O’Higgins',
  fundadaEn: 2009,
  direccion: 'Plaza de los Héroes 445, Rancagua',
  coordenadas: [-34.170311, -70.740843],
  esDemostracion: true,
  referencia: 'Municipalidad de Rancagua · entorno de Plaza de los Héroes',
  fuenteDireccion: 'https://rancagua.cl/?modulo=alcalde',
  centroCiudad: [-34.17, -70.74],
  telefono: null,
  correo: null,
  horario: null,
}

export function ubicacionConfirmada(datos) {
  const c = datos.coordenadas
  return Boolean(datos.direccion?.trim() && Array.isArray(c) && c.length===2 && c.every(Number.isFinite) && Math.abs(c[0])<=90 && Math.abs(c[1])<=180)
}

