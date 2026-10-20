export const correoValido = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
export const dominiosPorRol = {
  Administrador: "duocuc.cl",
  Dueño: "profesor.duoc.cl",
  Recepcionista: "gmail.com",
};
export const correoValidoParaRol = (correo, rol) =>
  correoValido(correo || "") &&
  (correo || "")
    .trim()
    .toLowerCase()
    .endsWith("@" + (dominiosPorRol[rol] || "__no_permitido__"));
export const claveValida = (clave) => clave.length >= 8;
export const textoRequerido = (texto) => String(texto ?? "").trim().length > 0;
export const telefonoValido = (telefono) =>
  !telefono || /^\+?[0-9 ]{8,15}$/.test(telefono);
export function validarRegistro(datos) {
  if (!textoRequerido(datos.nombre)) return "Ingresa tu nombre";
  if (!correoValidoParaRol(datos.correo || "", "Dueño"))
    return "El correo del dueño debe terminar en @profesor.duoc.cl";
  if (!claveValida(datos.clave || ""))
    return "La contraseña debe tener al menos 8 caracteres";
  if (!telefonoValido(datos.telefono || "")) return "El teléfono no es válido";
  return "";
}

export function validarPerfil(d) {
  if (!textoRequerido(d.nombre)) return "Ingresa tu nombre";
  if (!telefonoValido(d.telefono || "")) return "El teléfono no es válido";
  return "";
}
export function validarPaciente(d) {
  if (!textoRequerido(d.nombre)) return "Ingresa el nombre de la mascota";
  if (!["Perro", "Gato", "Conejo", "Ave", "Otro"].includes(d.especie))
    return "Selecciona una especie válida";
  if (
    d.edad === "" ||
    !Number.isInteger(Number(d.edad)) ||
    Number(d.edad) < 0 ||
    Number(d.edad) > 40
  )
    return "La edad debe estar entre 0 y 40 años";
  if (!Number.isInteger(Number(d.duenoId)) || Number(d.duenoId) <= 0)
    return "Selecciona un dueño";
  return "";
}
export function validarAtencion(
  d,
  hoy = new Date().toISOString().slice(0, 10),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha || "") ||
    Number.isNaN(Date.parse(d.fecha)) ||
    d.fecha > hoy
  )
    return "La fecha debe ser válida y no futura";
  if (!textoRequerido(d.diagnostico)) return "Ingresa el diagnóstico";
  if (d.proximoControl && d.proximoControl < d.fecha)
    return "El próximo control no puede ser anterior a la atención";
  return "";
}
