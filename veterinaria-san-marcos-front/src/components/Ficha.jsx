import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { validarAtencion } from "../validaciones";
import { servicios, medicamentos } from "../catalogo";

export default function Ficha({ pacientes, setPacientes }) {
  const { id } = useParams();
  const paciente = pacientes.find((x) => String(x.id) === id);
  const vacio = {
    fecha: "",
    tipo: "",
    diagnostico: "",
    medicamento: "",
    proximoControl: "",
    observacion: "",
  };
  const [f, setF] = useState(vacio);
  const [error, setError] = useState("");
  if (!paciente)
    return (
      <section className="tarjeta">
        <h1>Paciente no encontrado</h1>
        <Link to="/recepcion/pacientes">Volver</Link>
      </section>
    );
  const historial = paciente.historial || [];
  const actualizar = (datos) =>
    setPacientes((v) =>
      v.map((x) => (x.id === paciente.id ? { ...x, ...datos } : x)),
    );
  const guardar = (e) => {
    e.preventDefault();
    const fallo = validarAtencion(f);
    if (fallo) {
      setError(fallo);
      return;
    }
    actualizar({
      historial: [
        ...historial,
        {
          ...f,
          id: Date.now(),
          tipo: f.tipo || servicios[0]?.nombre || "Consulta",
        },
      ],
    });
    setF(vacio);
    setError("Atención registrada correctamente");
  };
  return (
    <section className="tarjeta">
      <Link to="/recepcion/pacientes">← Volver a pacientes</Link>
      <h1>Ficha clínica: {paciente.nombre}</h1>
      <p>
        {paciente.especie} · {paciente.raza || "Raza no indicada"} ·{" "}
        {paciente.edad} años
      </p>
      <label>
        Antecedentes y observaciones generales
        <textarea
          value={paciente.observaciones || ""}
          onChange={(e) => actualizar({ observaciones: e.target.value })}
        />
      </label>
      <h2>Registrar atención</h2>
      {error && <p role="status">{error}</p>}
      <form className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2" onSubmit={guardar}>
        <label>
          Fecha
          <input
            required
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={f.fecha}
            onChange={(e) => setF({ ...f, fecha: e.target.value })}
          />
        </label>
        <label>
          Servicio
          <select
            value={f.tipo}
            onChange={(e) => setF({ ...f, tipo: e.target.value })}
          >
            <option value="">Selecciona servicio</option>
            {servicios.map((x) => (
              <option key={x.codigo} value={x.nombre}>
                {x.nombre} ({x.codigo})
              </option>
            ))}
          </select>
        </label>
        <label>
          Diagnóstico
          <input
            required
            value={f.diagnostico}
            onChange={(e) => setF({ ...f, diagnostico: e.target.value })}
          />
        </label>
        <label>
          Medicamento o vacuna
          <select
            value={f.medicamento}
            onChange={(e) => setF({ ...f, medicamento: e.target.value })}
          >
            <option value="">Sin medicamento</option>
            {medicamentos.map((x) => (
              <option key={x.codigo} value={x.nombre}>
                {x.nombre} ({x.codigo})
              </option>
            ))}
          </select>
        </label>
        <label>
          Próximo control
          <input
            type="date"
            min={f.fecha || undefined}
            value={f.proximoControl}
            onChange={(e) => setF({ ...f, proximoControl: e.target.value })}
          />
        </label>
        <label>
          Indicaciones
          <textarea
            value={f.observacion}
            onChange={(e) => setF({ ...f, observacion: e.target.value })}
          />
        </label>
        <button>Guardar atención</button>
      </form>
      <h2>Historial clínico</h2>
      {historial.length === 0 ? (
        <p>No hay atenciones registradas.</p>
      ) : (
        historial.map((h, i) => (
          <article className="historial" key={h.id || i}>
            <strong>
              {h.fecha} · {h.tipo}
            </strong>
            <p>Diagnóstico: {h.diagnostico}</p>
            <p>Medicamento/vacuna: {h.medicamento || "No indicado"}</p>
            <p>Indicaciones: {h.observacion || "Sin indicaciones"}</p>
            <p>Próximo control: {h.proximoControl || "No definido"}</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Eliminar esta atención simulada?"))
                  actualizar({
                    historial: historial.filter((_, n) => n !== i),
                  });
              }}
            >
              Eliminar atención
            </button>
          </article>
        ))
      )}
    </section>
  );
}
