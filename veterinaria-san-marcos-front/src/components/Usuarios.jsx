import { useState } from "react";
import NombreUsuarioEditable from "./NombreUsuarioEditable";
import FormularioUsuario from "./FormularioUsuario.jsx";

export default function Usuarios({
  usuarios,
  setUsuarios,
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
          guardar={(datos) => {
            setUsuarios(actuales => editando
              ? actuales.map(u => u.id === editando.id ? { ...u, nombre: datos.nombre, correo: datos.correo, rol: datos.rol } : u)
              : [...actuales, { ...datos, id: Math.max(0, ...actuales.map(u => Number(u.id))) + 1, activo: true }]);
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
                  (u.nombre + " " + u.correo)
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
                        guardar={(id, nombre) =>
                          setUsuarios((v) =>
                            v.map((x) => (x.id === id ? { ...x, nombre } : x)),
                          )
                        }
                      />
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      {u.rol}
                    </td>
                    <td>{u.activo ? "Activo" : "Inactivo"}</td>
                    <td>
                      <button type="button" aria-label={`Editar usuario ${u.nombre}`} onClick={() => { setEditando(u); setNuevo(false); }}>Editar usuario</button>
                      <button
                        disabled={u.id === sesion.id}
                        onClick={() =>
                          setUsuarios((v) =>
                            v.map((x) =>
                              x.id === u.id ? { ...x, activo: !x.activo } : x,
                            ),
                          )
                        }
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        className="boton-eliminar"
                        disabled={u.id === sesion.id}
                        onClick={() => {
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
                            setUsuarios((v) => v.filter((x) => x.id !== u.id));
                            setMensaje("Cliente eliminado correctamente");
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
