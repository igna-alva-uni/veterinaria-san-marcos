import { useState } from 'react'
import { claveValida, correoValidoParaRol, dominiosPorRol, runValido, telefonoValido, textoRequerido } from '../validaciones.js'

// Alta y edición de cuentas. El backend repite estas validaciones (RUN, dominio por rol, correo único).
export default function FormularioUsuario({ usuario, usuarios, propio, guardar, cancelar }) {
  const [datos, setDatos] = useState(usuario || { run: '', nombre: '', apellido: '', correo: '', telefono: '', clave: '', rol: 'Dueño' })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const cambiar = (campo, valor) => setDatos(actual => ({ ...actual, [campo]: valor }))
  async function enviar(evento) {
    evento.preventDefault()
    const correo = datos.correo.trim().toLowerCase()
    if (!usuario && !runValido(datos.run)) return setError('Ingresa un RUN válido (ej. 12345678-5).')
    if (!textoRequerido(datos.nombre)) return setError('Ingresa el nombre del usuario.')
    if (!textoRequerido(datos.apellido)) return setError('Ingresa el apellido del usuario.')
    if (!correoValidoParaRol(correo, datos.rol)) return setError(`El correo para ${datos.rol} debe terminar en @${dominiosPorRol[datos.rol]}.`)
    if (usuarios.some(u => u.id !== usuario?.id && u.correo.trim().toLowerCase() === correo)) return setError('Ya existe un usuario con ese correo.')
    if (!telefonoValido(datos.telefono || '')) return setError('El teléfono no es válido.')
    if (!usuario && !claveValida(datos.clave)) return setError('La contraseña debe tener al menos 8 caracteres.')
    setGuardando(true)
    try {
      await guardar({ ...datos, nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), correo, rol: propio ? usuario.rol : datos.rol })
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setGuardando(false)
    }
  }
  return <form aria-label={usuario ? 'Editar usuario' : 'Nuevo usuario'} className="tarjeta formulario" onSubmit={enviar}>
    <h2>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h2>
    {error && <p role="alert">{error}</p>}
    {usuario
      ? <p>RUN: {usuario.run}</p>
      : <label>RUN<input required value={datos.run} placeholder="12345678-5" onChange={e => cambiar('run', e.target.value)} /></label>}
    <label>Nombre<input required value={datos.nombre} onChange={e => cambiar('nombre', e.target.value)} /></label>
    <label>Apellido<input required value={datos.apellido} onChange={e => cambiar('apellido', e.target.value)} /></label>
    <label>Rol<select aria-label="Rol" value={datos.rol} disabled={propio} onChange={e => cambiar('rol', e.target.value)}>
      {Object.keys(dominiosPorRol).map(rol => <option key={rol}>{rol}</option>)}
    </select></label>
    <label>Correo<input type="email" required value={datos.correo} onChange={e => cambiar('correo', e.target.value)} aria-describedby="dominio-usuario" /></label>
    <p id="dominio-usuario">Dominio requerido: @{dominiosPorRol[datos.rol]}. Al cambiar el rol, actualiza también el correo.</p>
    <label>Teléfono<input value={datos.telefono || ''} onChange={e => cambiar('telefono', e.target.value)} /></label>
    {!usuario && <label>Contraseña<input type="password" required minLength={8} value={datos.clave} onChange={e => cambiar('clave', e.target.value)} /></label>}
    {propio && <p>Tu cuenta conserva su rol y permanece activa.</p>}
    <button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
    <button type="button" onClick={cancelar}>Cancelar edición</button>
  </form>
}
