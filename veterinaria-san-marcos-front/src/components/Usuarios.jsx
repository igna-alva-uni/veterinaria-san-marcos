import { useState } from "react";
import NombreUsuarioEditable from "./NombreUsuarioEditable";
import Formulario from "./Formulario";
import { correoValidoParaRol, claveValida, textoRequerido } from "../validaciones";

export default function Usuarios({
  usuarios,
  setUsuarios,
  setMensaje,
  sesion,
  pacientes,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [nuevo, setNuevo] = useState(false);
  return (
    <section className="tarjeta">
      <h1>Gestión de usuarios</h1>
      <p>Administración de cuentas y roles (datos simulados).</p>
      <input
        placeholder="Buscar por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button onClick={() => setNuevo(!nuevo)}>
        {nuevo ? "Cancelar" : "Crear usuario"}
      </button>
      {nuevo && (
        <Formulario
          titulo="Nuevo usuario"
          campos={[
            ["nombre", "Nombre"],
            ["correo", "Correo", "email"],
            ["clave", "Contraseña", "password"],
          ]}
          boton="Guardar"
          enviar={(d) => {
            if (
              !textoRequerido(d.nombre) ||
              !correoValidoParaRol(d.correo, "Dueño") ||
              !claveValida(d.clave || "") ||
              usuarios.some(
                (u) => u.correo.toLowerCase() === d.correo.toLowerCase(),
              )
            ) {
              setMensaje(
                "Revisa nombre, correo @profesor.duoc.cl, contraseña (mínimo 8 caracteres) o correo duplicado",
              );
              return;
            }
            setUsuarios((v) => [
              ...v,
              {
                ...d,
                nombre: d.nombre.trim(),
                correo: d.correo.trim().toLowerCase(),
                id: Date.now(),
                rol: "Dueño",
                activo: true,
              },
            ]);
            setNuevo(false);
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
                      <select
                        aria-label={"Rol " + u.id}
                        value={u.rol}
                        disabled={u.id === sesion.id}
                        onChange={(e) => {
                          if (!correoValidoParaRol(u.correo, e.target.value)) {
                            setMensaje(
                              "El correo de este usuario no corresponde al dominio requerido para ese rol",
                            );
                            return;
                          }
                          setUsuarios((v) =>
                            v.map((x) =>
                              x.id === u.id ? { ...x, rol: e.target.value } : x,
                            ),
                          );
                        }}
                      >
                        {["Administrador", "Recepcionista", "Dueño"].map(
                          (r) => (
                            <option key={r}>{r}</option>
                          ),
                        )}
                      </select>
                    </td>
                    <td>{u.activo ? "Activo" : "Inactivo"}</td>
                    <td>
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
