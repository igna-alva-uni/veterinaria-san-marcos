import { useState } from 'react'
import { claveValida, correoValidoParaRol, dominiosPorRol, textoRequerido } from '../validaciones.js'

export default function FormularioUsuario({ usuario, usuarios, propio, guardar, cancelar }) {
  const [datos, setDatos] = useState(usuario || { nombre: '', correo: '', clave: '', rol: 'Dueño' })
  const [error, setError] = useState('')
  const cambiar = (campo, valor) => setDatos(actual => ({ ...actual, [campo]: valor }))
  function enviar(evento) {
    evento.preventDefault()
    const correo = datos.correo.trim().toLowerCase()
    if (!textoRequerido(datos.nombre)) return setError('Ingresa el nombre del usuario.')
    if (!correoValidoParaRol(correo, datos.rol)) return setError(`El correo para ${datos.rol} debe terminar en @${dominiosPorRol[datos.rol]}.`)
    if (usuarios.some(u => u.id !== usuario?.id && u.correo.trim().toLowerCase() === correo)) return setError('Ya existe un usuario con ese correo.')
    if (!usuario && !claveValida(datos.clave)) return setError('La contraseña debe tener al menos 8 caracteres.')
    guardar({ ...datos, nombre: datos.nombre.trim(), correo, rol: propio ? usuario.rol : datos.rol })
  }
  return <form aria-label={usuario ? 'Editar usuario' : 'Nuevo usuario'} className="tarjeta formulario" onSubmit={enviar}>
    <h2>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h2>
    {error && <p role="alert">{error}</p>}
    <label>Nombre<input required value={datos.nombre} onChange={e => cambiar('nombre', e.target.value)} /></label>
    <label>Rol<select aria-label="Rol" value={datos.rol} disabled={propio} onChange={e => cambiar('rol', e.target.value)}>
      {Object.keys(dominiosPorRol).map(rol => <option key={rol}>{rol}</option>)}
    </select></label>
    <label>Correo<input type="email" required value={datos.correo} onChange={e => cambiar('correo', e.target.value)} aria-describedby="dominio-usuario" /></label>
    <p id="dominio-usuario">Dominio requerido: @{dominiosPorRol[datos.rol]}. Al cambiar el rol, actualiza también el correo.</p>
    {!usuario && <label>Contraseña<input type="password" required minLength={8} value={datos.clave} onChange={e => cambiar('clave', e.target.value)} /></label>}
    {propio && <p>Tu cuenta conserva su rol y permanece activa.</p>}
    <button type="submit">Guardar</button>
    <button type="button" onClick={cancelar}>Cancelar edición</button>
  </form>
}
