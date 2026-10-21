import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { validarAtencion } from "../validaciones";
import { servicios, medicamentos } from "../catalogo";
import { fechaLocal } from '../data/panel.js';
import { vacunaDeAtencion } from '../data/vacunas.js';

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
    vacuna: { nombre: '', vencimiento: '' },
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
          vacuna: f.vacuna.nombre.trim() ? { ...f.vacuna, nombre: f.vacuna.nombre.trim() } : null,
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
            max={fechaLocal()}
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
        <fieldset className="min-w-0 rounded-xl border border-[var(--border)] p-4 md:col-span-2">
          <legend>Vacuna aplicada (opcional)</legend>
          <p>Completa estos datos solo si se aplicó una vacuna. El vencimiento debe corresponder al registrado por el profesional.</p>
          <label>Nombre de la vacuna
            <input list="vacunas-catalogo" value={f.vacuna.nombre} onChange={e => setF({ ...f, vacuna: { ...f.vacuna, nombre: e.target.value } })} />
          </label>
          <datalist id="vacunas-catalogo">{servicios.filter(s => s.categoria === 'Vacunación').map(s => <option key={s.codigo} value={s.nombre} />)}</datalist>
          <label>Vencimiento de la vacuna
            <input type="date" required={Boolean(f.vacuna.nombre.trim())} min={f.fecha || undefined} value={f.vacuna.vencimiento} onChange={e => setF({ ...f, vacuna: { ...f.vacuna, vencimiento: e.target.value } })} />
          </label>
        </fieldset>
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
            {vacunaDeAtencion(h) && <><p>Vacuna aplicada: {vacunaDeAtencion(h).nombre}</p><p>Vencimiento de vacuna: {vacunaDeAtencion(h).vencimiento || 'No registrado'}</p></>}
            <p>Indicaciones: {h.observacion || "Sin indicaciones"}</p>
            <p>Próximo control: {h.proximoControl || "No definido"}</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Eliminar esta atención?"))
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
