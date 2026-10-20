import { useEffect, useState } from "react";
import { validarPaciente } from "../validaciones";

export default function PacienteEditable({ paciente, guardar }) {
  const [datos, setDatos] = useState({
    nombre: paciente.nombre,
    especie: paciente.especie,
    edad: String(paciente.edad),
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setDatos({
      nombre: paciente.nombre,
      especie: paciente.especie,
      edad: String(paciente.edad),
    });
  }, [paciente.nombre, paciente.especie, paciente.edad]);

  const confirmar = () => {
    const fallo = validarPaciente({ ...paciente, ...datos });

    if (fallo) {
      setError(fallo);
      return;
    }

    guardar(paciente.id, {
      ...datos,
      nombre: datos.nombre.trim(),
      edad: Number(datos.edad),
    });

    setError("");
  };

  return (
    <>
      <td>
        <input
          aria-label={"Mascota " + paciente.id}
          value={datos.nombre}
          onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
        />
      </td>

      <td>
        <select
          aria-label={"Especie " + paciente.id}
          value={datos.especie}
          onChange={(e) => setDatos({ ...datos, especie: e.target.value })}
        >
          {["Perro", "Gato", "Conejo", "Ave", "Otro"].map((es) => (
            <option key={es}>{es}</option>
          ))}
        </select>
      </td>

      <td>
        <input
          aria-label={"Edad " + paciente.id}
          type="number"
          min="0"
          max="40"
          value={datos.edad}
          onChange={(e) => setDatos({ ...datos, edad: e.target.value })}
        />
      </td>

      <td>
        <button type="button" onClick={confirmar}>
          Guardar paciente
        </button>

        <button
          type="button"
          onClick={() => {
            setDatos({
              nombre: paciente.nombre,
              especie: paciente.especie,
              edad: String(paciente.edad),
            });
            setError("");
          }}
        >
          Cancelar edición
        </button>

        {error && <p role="alert">{error}</p>}
      </td>
    </>
  );
}
