import { useState } from "react";

export default function Formulario({
  titulo,
  campos,
  boton,
  enviar,
  inicial = {},
  pie,
}) {
  const [datos, setDatos] = useState(inicial);

  return (
    <form
      className="tarjeta formulario"
      onSubmit={(e) => {
        e.preventDefault();
        enviar(datos);
      }}
    >
      <h2>{titulo}</h2>

      {campos.map(([clave, etiqueta, tipo]) => (
        <label key={clave}>
          {etiqueta}

          {tipo === "textarea" ? (
            <textarea
              required
              value={datos[clave] || ""}
              onChange={(e) => setDatos({ ...datos, [clave]: e.target.value })}
            />
          ) : (
            <input
              required={clave !== "telefono"}
              type={tipo || "text"}
              value={datos[clave] || ""}
              onChange={(e) => setDatos({ ...datos, [clave]: e.target.value })}
            />
          )}
        </label>
      ))}

      <button type="submit">{boton}</button>

      {pie}
    </form>
  );
}
