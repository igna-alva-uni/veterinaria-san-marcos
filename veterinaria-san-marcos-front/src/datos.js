// Datos exclusivamente ficticios para Parcial 2.
export const usuariosIniciales = [
  {
    id: 1,
    nombre: "Administración",
    correo: "admin@duocuc.cl",
    rol: "Administrador",
    clave: "Admin12345",
    activo: true,
  },
  {
    id: 2,
    nombre: "Recepción",
    correo: "recepcion@gmail.com",
    rol: "Recepcionista",
    clave: "Recepcion123",
    activo: true,
  },
  {
    id: 3,
    nombre: "Cliente",
    correo: "cliente@profesor.duoc.cl",
    rol: "Dueño",
    clave: "Cliente123",
    activo: true,
  },
];
export const pacientesIniciales = [
  {
    id: 1,
    nombre: "Luna",
    especie: "Perro",
    raza: "Mestiza",
    edad: 4,
    duenoId: 3,
    observaciones: "Control general",
    historial: [
      {
        fecha: "2026-09-10",
        tipo: "Consulta general",
        diagnostico: "Control preventivo",
        medicamento: "Ninguno",
        proximoControl: "2027-03-10",
      },
    ],
  },
  {
    id: 2,
    nombre: "Michi",
    especie: "Gato",
    raza: "Común europeo",
    edad: 2,
    duenoId: 3,
    observaciones: "Vacunación",
    historial: [],
  },
];
