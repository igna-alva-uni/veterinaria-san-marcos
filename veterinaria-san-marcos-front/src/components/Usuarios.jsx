import { useState } from "react";
import NombreUsuarioEditable from "./NombreUsuarioEditable";
import FormularioUsuario from "./FormularioUsuario.jsx";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  eliminarUsuario,
} from "../api/usuarios.js";

// CRUD de usuarios contra ms-usuarios (solo rol Administrador, validado también en el backend).
export default function Usuarios({
  usuarios,
  recargar,
  setMensaje,
  sesion,
  pacientes,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const [editando, setEditando] = useState(null);
  return (
    <section className="tarjeta">
      <h1>Gestión de usuarios</h1>
      <p>Administra las cuentas, los roles y el acceso al sistema.</p>
      <input
        placeholder="Buscar por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button onClick={() => { setNuevo(!nuevo); setEditando(null); }}>
        {nuevo ? "Cancelar" : "Crear usuario"}
      </button>
      {(nuevo || editando) && (
        <FormularioUsuario
          key={editando?.id || 'nuevo'}
          usuario={editando}
          usuarios={usuarios}
          propio={editando?.id === sesion.id}
          cancelar={() => { setNuevo(false); setEditando(null); }}
          guardar={async (datos) => {
            if (editando) await actualizarUsuario(editando.id, datos);
            else await crearUsuario(datos);
            await recargar();
            setMensaje(editando ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
            setNuevo(false);
            setEditando(null);
          }}
        />
      )}
      <div className="tabla-contenedor">
        <p className="aviso-deslizamiento">
          ↔ Desliza la tabla hacia los lados para ver más columnas.
        </p>
        <div
          className="tabla overflow-x-auto"
          role="region"
          aria-label="Tabla con desplazamiento horizontal"
          tabIndex={0}
        >
          <table className="w-full border-collapse text-left [&_tbody_tr:hover]:bg-[var(--surface-soft)]">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios
                .filter((u) =>
                  (u.nombreCompleto + " " + u.correo + " " + u.run)
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()),
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <NombreUsuarioEditable
                        key={`${u.id}-${u.nombre}`}
                        usuario={u}
                        avisar={setMensaje}
                        guardar={(id, nombre) => actualizarUsuario(id, { ...u, nombre }).then(recargar)}
                      />
                    </td>
                    <td>{u.correo}<br /><small>RUN {u.run}</small></td>
                    <td>
                      {u.rol}
                    </td>
                    <td>{u.activo ? "Activo" : "Inactivo"}</td>
                    <td>
                      <button type="button" aria-label={`Editar usuario ${u.nombre}`} onClick={() => { setEditando(u); setNuevo(false); }}>Editar usuario</button>
                      <button
                        disabled={u.id === sesion.id}
                        onClick={async () => {
                          try {
                            await cambiarEstadoUsuario(u.id, !u.activo);
                            await recargar();
                            setMensaje(u.activo ? "Usuario desactivado" : "Usuario activado");
                          } catch (error) {
                            setMensaje(error.message);
                          }
                        }}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        className="boton-eliminar"
                        disabled={u.id === sesion.id}
                        onClick={async () => {
                          if (u.rol !== "Dueño") {
                            setMensaje(
                              "Solo se pueden eliminar clientes desde esta opción",
                            );
                            return;
                          }

                          if (pacientes.some((p) => p.duenoId === u.id)) {
                            setMensaje(
                              "No puedes eliminar este cliente porque tiene mascotas registradas",
                            );
                            return;
                          }

                          if (
                            window.confirm(
                              "¿Seguro que deseas eliminar a " + u.nombre + "?",
                            )
                          ) {
                            try {
                              await eliminarUsuario(u.id);
                              await recargar();
                              setMensaje("Cliente eliminado correctamente");
                            } catch (error) {
                              setMensaje(error.message);
                            }
                          }
                        }}
                      >
                        Eliminar cliente
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
