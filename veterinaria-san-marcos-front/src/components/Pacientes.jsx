import { useState } from "react";
import PacienteEditable from "./PacienteEditable";
import { validarPaciente } from "../validaciones";

export default function Pacientes({ pacientes, setPacientes, usuarios, ir }) {
  const [f, setF] = useState({
    nombre: "",
    especie: "Perro",
    raza: "",
    edad: "",
    duenoId: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const guardarEdicion = (id, datos) =>
    setPacientes((v) => v.map((x) => (x.id === id ? { ...x, ...datos } : x)));
  return (
    <section className="tarjeta">
      <h1>Gestión de pacientes</h1>
      <p>Registro y edición de mascotas.</p>
      {error && <p role="alert">{error}</p>}
      <form
        className="rejilla row g-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fallo = validarPaciente(f);
          if (fallo) {
            setError(fallo);
            return;
          }
          setError("");
          setPacientes((v) => [
            ...v,
            {
              ...f,
              id: Date.now(),
              edad: Number(f.edad),
              duenoId: Number(f.duenoId),
              historial: [],
              observaciones: "",
            },
          ]);
          setF({
            nombre: "",
            especie: "Perro",
            raza: "",
            edad: "",
            duenoId: "",
          });
        }}
      >
        <label>
          Nombre
          <input
            required
            value={f.nombre}
            onChange={(e) => setF({ ...f, nombre: e.target.value })}
          />
        </label>
        <label>
          Especie
          <select
            value={f.especie}
            onChange={(e) => setF({ ...f, especie: e.target.value })}
          >
            {["Perro", "Gato", "Conejo", "Ave", "Otro"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Raza
          <input
            value={f.raza}
            onChange={(e) => setF({ ...f, raza: e.target.value })}
          />
        </label>
        <label>
          Edad (años)
          <input
            required
            type="number"
            min="0"
            max="40"
            value={f.edad}
            onChange={(e) => setF({ ...f, edad: e.target.value })}
          />
        </label>
        <label>
          Dueño
          <select
            required
            value={f.duenoId}
            onChange={(e) => setF({ ...f, duenoId: e.target.value })}
          >
            <option value="">Selecciona dueño</option>
            {usuarios
              .filter((x) => x.rol === "Dueño" && x.activo)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
          </select>
        </label>
        <button>Registrar mascota</button>
      </form>
      <input
        placeholder="Buscar mascota"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="tabla-contenedor">
        <p className="aviso-deslizamiento">
          ↔ Desliza la tabla hacia los lados para ver más columnas.
        </p>
        <div
          className="tabla table-responsive"
          role="region"
          aria-label="Tabla con desplazamiento horizontal"
          tabIndex={0}
        >
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Edad</th>
                <th>Edición</th>
                <th>Dueño</th>
                <th>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {pacientes
                .filter((x) =>
                  (
                    x.nombre +
                    " " +
                    x.especie +
                    " " +
                    (usuarios.find((u) => u.id === x.duenoId)?.nombre || "")
                  )
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()),
                )
                .map((x) => (
                  <tr key={x.id}>
                    <PacienteEditable paciente={x} guardar={guardarEdicion} />
                    <td>
                      {usuarios.find((u) => u.id === x.duenoId)?.nombre ||
                        "Sin dueño"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => ir("/recepcion/pacientes/" + x.id)}
                      >
                        Ver ficha
                      </button>

                      <button
                        type="button"
                        className="boton-eliminar"
                        onClick={() => {
                          if (
                            window.confirm(
                              "¿Seguro que deseas eliminar a " +
                                x.nombre +
                                "?\n\nTambién se eliminará su historial clínico.",
                            )
                          ) {
                            setPacientes((v) => v.filter((p) => p.id !== x.id));
                          }
                        }}
                      >
                        Eliminar mascota
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
