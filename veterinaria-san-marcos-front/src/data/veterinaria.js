
const CLAVE_MASCOTAS = 'vsm-mascotas'
const CLAVE_CITAS = 'vsm-citas'

const mascotasIniciales = [
  {
    id: 1,
    nombre: 'Luna',
    especie: 'Perro',
    raza: 'Labrador',
    edad: '3 años',
    sexo: 'Hembra',
  },
  {
    id: 2,
    nombre: 'Michi',
    especie: 'Gato',
    raza: 'Mestizo',
    edad: '2 años',
    sexo: 'Macho',
  },
]

function leerLista(clave, valorInicial = []) {
  try {
    const guardado = localStorage.getItem(clave)

    if (guardado === null) {
      return valorInicial
    }

    const datos = JSON.parse(guardado)
    return Array.isArray(datos) ? datos : valorInicial
  } catch {
    return valorInicial
  }
}

function guardarLista(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos))
    return true
  } catch {
    return false
  }
}

// MASCOTAS

export function obtenerMascotas() {
  return leerLista(CLAVE_MASCOTAS, mascotasIniciales)
}

export function obtenerMascotaPorId(id) {
  return (
    obtenerMascotas().find(
      (mascota) => String(mascota.id) === String(id),
    ) ?? null
  )
}

export function registrarMascota(datos) {
  const nombre = datos.nombre?.trim()

  if (!nombre) {
    return { ok: false, mensaje: 'Ingresa el nombre de la mascota.' }
  }

  const mascotas = obtenerMascotas()

  const nuevaMascota = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    nombre,
    especie: datos.especie || 'Otro',
    raza: datos.raza?.trim() || 'No registrada',
    edad: datos.edad?.trim() || 'No registrada',
    sexo: datos.sexo || 'No especificado',
  }

  const guardado = guardarLista(CLAVE_MASCOTAS, [
    ...mascotas,
    nuevaMascota,
  ])

  if (!guardado) {
    return {
      ok: false,
      mensaje: 'No se pudo guardar la mascota en este navegador.',
    }
  }

  return { ok: true, mascota: nuevaMascota }
}

export function actualizarMascota(id, cambios) {
  const mascotas = obtenerMascotas()
  const existe = mascotas.some(
    (mascota) => String(mascota.id) === String(id),
  )

  if (!existe) {
    return { ok: false, mensaje: 'No se encontró la mascota.' }
  }

  const nombre = cambios.nombre?.trim()

  if (cambios.nombre !== undefined && !nombre) {
    return {
      ok: false,
      mensaje: 'El nombre de la mascota no puede quedar vacío.',
    }
  }

  const actualizadas = mascotas.map((mascota) =>
    String(mascota.id) === String(id)
      ? {
          ...mascota,
          ...cambios,
          nombre: nombre ?? mascota.nombre,
          raza: cambios.raza?.trim() || 'No registrada',
          edad: cambios.edad?.trim() || 'No registrada',
        }
      : mascota,
  )

  const guardado = guardarLista(CLAVE_MASCOTAS, actualizadas)

  return guardado
    ? { ok: true }
    : { ok: false, mensaje: 'No se pudieron guardar los cambios.' }
}

export function eliminarMascota(id) {
  const mascotas = obtenerMascotas()
  const existe = mascotas.some(
    (mascota) => String(mascota.id) === String(id),
  )

  if (!existe) {
    return { ok: false, mensaje: 'No se encontró la mascota.' }
  }

  const actualizadas = mascotas.filter(
    (mascota) => String(mascota.id) !== String(id),
  )

  const guardado = guardarLista(CLAVE_MASCOTAS, actualizadas)

  return guardado
    ? { ok: true }
    : { ok: false, mensaje: 'No se pudo eliminar la mascota.' }
}

// CITAS

export function obtenerCitas() {
  return leerLista(CLAVE_CITAS)
}

export function obtenerCitaPorId(id) {
  return (
    obtenerCitas().find(
      (cita) => String(cita.id) === String(id),
    ) ?? null
  )
}

export function registrarCita(datos) {
  const mascotas = obtenerMascotas()
  const mascota = mascotas.find(
    (item) => String(item.id) === String(datos.mascotaId),
  )

  if (!mascota) {
    return {
      ok: false,
      mensaje: 'Selecciona una mascota registrada.',
    }
  }

  if (!datos.servicio || !datos.fecha || !datos.hora) {
    return {
      ok: false,
      mensaje: 'Completa el servicio, la fecha y el horario.',
    }
  }

  const citas = obtenerCitas()

  const horarioOcupado = citas.some(
    (cita) =>
      cita.fecha === datos.fecha &&
      cita.hora === datos.hora &&
      cita.estado !== 'Cancelada',
  )

  if (horarioOcupado) {
    return {
      ok: false,
      mensaje: 'Ese horario ya tiene una solicitud activa.',
    }
  }

  const nuevaCita = {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    mascotaId: mascota.id,
    mascotaNombre: mascota.nombre,
    servicio: datos.servicio,
    fecha: datos.fecha,
    hora: datos.hora,
    motivo: datos.motivo?.trim() || '',
    precio: datos.precio ?? null,
    estado: 'Pendiente de confirmación',
    creadaEn: new Date().toISOString(),
  }

  const guardado = guardarLista(CLAVE_CITAS, [...citas, nuevaCita])

  if (!guardado) {
    return {
      ok: false,
      mensaje: 'No se pudo guardar la cita en este navegador.',
    }
  }

  return { ok: true, cita: nuevaCita }
}

export function actualizarEstadoCita(id, estado) {
  const estadosPermitidos = [
    'Pendiente de confirmación',
    'Confirmada',
    'Cancelada',
    'Reprogramada',
  ]

  if (!estadosPermitidos.includes(estado)) {
    return { ok: false, mensaje: 'El estado indicado no es válido.' }
  }

  const citas = obtenerCitas()
  const existe = citas.some(
    (cita) => String(cita.id) === String(id),
  )

  if (!existe) {
    return { ok: false, mensaje: 'No se encontró la cita.' }
  }

  const actualizadas = citas.map((cita) =>
    String(cita.id) === String(id) ? { ...cita, estado } : cita,
  )

  const guardado = guardarLista(CLAVE_CITAS, actualizadas)

  return guardado
    ? { ok: true }
    : { ok: false, mensaje: 'No se pudo actualizar el estado de la cita.' }
}

export function reprogramarCita(id, fecha, hora) {
  if (!fecha || !hora) {
    return {
      ok: false,
      mensaje: 'Selecciona una nueva fecha y hora.',
    }
  }

  const citas = obtenerCitas()
  const cita = citas.find((item) => String(item.id) === String(id))

  if (!cita) {
    return { ok: false, mensaje: 'No se encontró la cita.' }
  }

  const horarioOcupado = citas.some(
    (item) =>
      String(item.id) !== String(id) &&
      item.fecha === fecha &&
      item.hora === hora &&
      item.estado !== 'Cancelada',
  )

  if (horarioOcupado) {
    return {
      ok: false,
      mensaje: 'Ese horario ya tiene una solicitud activa.',
    }
  }

  const actualizadas = citas.map((item) =>
    String(item.id) === String(id)
      ? {
          ...item,
          fecha,
          hora,
          estado: 'Pendiente de confirmación',
        }
      : item,
  )

  const guardado = guardarLista(CLAVE_CITAS, actualizadas)

  return guardado
    ? { ok: true }
    : { ok: false, mensaje: 'No se pudo reprogramar la cita.' }
}
