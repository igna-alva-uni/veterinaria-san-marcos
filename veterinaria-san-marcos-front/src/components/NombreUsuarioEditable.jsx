import { useState } from "react";
import { textoRequerido } from "../validaciones";

export default function NombreUsuarioEditable({ usuario, guardar, avisar }) {
  const [nombre, setNombre] = useState(usuario.nombre);

  const confirmar = () => {
    if (!textoRequerido(nombre)) {
      avisar("El nombre del usuario no puede estar vacío");
      return;
    }

    guardar(usuario.id, nombre.trim());
    avisar("Nombre de usuario actualizado");
  };

  return (
    <div>
      <input
        aria-label={"Nombre " + usuario.id}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <button type="button" onClick={confirmar}>
        Guardar nombre
      </button>

      <button type="button" onClick={() => setNombre(usuario.nombre)}>
        Cancelar edición
      </button>
    </div>
  );
}
