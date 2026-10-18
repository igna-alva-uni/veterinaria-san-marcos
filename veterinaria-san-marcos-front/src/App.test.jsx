// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import App from "./App";

function abrir(ruta = "/login", sesion = null) {
  window.history.replaceState({}, "", ruta);
  if (sesion) localStorage.setItem("vet_sesion", JSON.stringify(sesion));
  return render(<App />);
}
function ingresar(correo, clave) {
  fireEvent.change(screen.getByLabelText("Correo electrónico"), {
    target: { value: correo },
  });
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: clave },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
}
const admin = {
  id: 1,
  nombre: "Administración",
  correo: "admin@duocuc.cl",
  rol: "Administrador",
  clave: "Admin12345",
  activo: true,
};
const recepcion = {
  id: 2,
  nombre: "Recepción",
  correo: "recepcion@gmail.com",
  rol: "Recepcionista",
  clave: "Recepcion123",
  activo: true,
};
const dueno = {
  id: 3,
  nombre: "Cliente",
  correo: "cliente@profesor.duoc.cl",
  rol: "Dueño",
  clave: "Cliente123",
  activo: true,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("Componentes e interacciones del módulo Daniel", () => {
  it("muestra login sin header ni footer", () => {
    const { container } = abrir();
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("footer")).toBeNull();
  });
  it("rechaza credenciales incorrectas", () => {
    abrir();
    ingresar("admin@duocuc.cl", "Incorrecta123");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    );
  });
  it("permite acceso al administrador", () => {
    abrir();
    ingresar("admin@duocuc.cl", "Admin12345");
    expect(
      screen.getByRole("heading", { name: "Gestión de usuarios" }),
    ).toBeInTheDocument();
  });
  it("permite acceso a recepción", () => {
    abrir();
    ingresar("recepcion@gmail.com", "Recepcion123");
    expect(
      screen.getByRole("heading", { name: "Gestión de pacientes" }),
    ).toBeInTheDocument();
  });
  it("permite acceso al dueño y muestra solo sus mascotas", () => {
    abrir();
    ingresar("cliente@profesor.duoc.cl", "Cliente123");
    expect(
      screen.getByRole("heading", { name: "Mi perfil" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Luna · Perro/)).toBeInTheDocument();
  });
  it("impide acceder a administración desde rol dueño", () => {
    abrir("/admin/usuarios", dueno);
    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument();
  });
  it("redirige al login si no existe sesión", () => {
    abrir("/admin/reportes");
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });
  it("valida el dominio del dueño en registro", () => {
    abrir("/registro");
    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Persona Ejemplo" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "persona@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Clave12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(screen.getByRole("alert")).toHaveTextContent("@profesor.duoc.cl");
  });
  it("registra un dueño con correo permitido", () => {
    abrir("/registro");
    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Persona Ejemplo" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "persona@profesor.duoc.cl" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Clave12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("vet_usuarios"))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          correo: "persona@profesor.duoc.cl",
          rol: "Dueño",
        }),
      ]),
    );
  });
  it("cierra sesión desde el perfil", () => {
    abrir("/perfil", dueno);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });
  it("filtra usuarios en administración", () => {
    abrir("/admin/usuarios", admin);
    fireEvent.change(
      screen.getByPlaceholderText("Buscar por nombre o correo"),
      { target: { value: "recepcion@gmail.com" } },
    );
    const filas = screen.getAllByRole("row");
    expect(filas).toHaveLength(2);
    expect(
      within(filas[1]).getByText("recepcion@gmail.com"),
    ).toBeInTheDocument();
  });
  it("crea un dueño desde administración", () => {
    abrir("/admin/usuarios", admin);
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Nuevo Dueño" },
    });
    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "nuevo@profesor.duoc.cl" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Clave12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(screen.getByText("nuevo@profesor.duoc.cl")).toBeInTheDocument();
  });
  it("filtra pacientes por nombre", () => {
    abrir("/recepcion/pacientes", recepcion);

    fireEvent.change(screen.getByPlaceholderText("Buscar mascota"), {
      target: { value: "Michi" },
    });

    expect(screen.getAllByRole("row")).toHaveLength(2);

    expect(screen.getByRole("textbox", { name: "Mascota 2" })).toHaveValue(
      "Michi",
    );
  });
  it("muestra una ficha clínica existente", () => {
    abrir("/recepcion/pacientes/1", recepcion);
    expect(
      screen.getByRole("heading", { name: "Ficha clínica: Luna" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Control preventivo/)).toBeInTheDocument();
  });
  it("muestra métricas de reportes para administrador", () => {
    abrir("/admin/reportes", admin);
    expect(
      screen.getByRole("heading", { name: "Reportes administrativos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pacientes registrados")).toBeInTheDocument();
  });
  it("muestra formulario de contacto", () => {
    abrir("/contacto");
    expect(
      screen.getByRole("heading", { name: "Contacto" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar consulta" }),
    ).toBeInTheDocument();
  });
});

describe("Edición validada de registros", () => {
  it("impide guardar un nombre de usuario vacío", () => {
    abrir("/admin/usuarios", admin);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre 2" }), {
      target: { value: "   " },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Guardar nombre" })[1],
    );
    expect(
      screen.getByText("El nombre del usuario no puede estar vacío"),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("vet_usuarios"))[1].nombre).toBe(
      "Recepción",
    );
  });
  it("guarda el nombre válido de un usuario", () => {
    abrir("/admin/usuarios", admin);
    fireEvent.change(screen.getByRole("textbox", { name: "Nombre 2" }), {
      target: { value: "Nueva Recepción" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Guardar nombre" })[1],
    );
    expect(screen.getByRole("textbox", { name: "Nombre 2" })).toHaveValue(
      "Nueva Recepción",
    );
  });
  it("rechaza edades inválidas de pacientes", () => {
    abrir("/recepcion/pacientes", recepcion);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Edad 2" }), {
      target: { value: "41" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Guardar paciente" })[1],
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "La edad debe estar entre 0 y 40 años",
    );
  });
  it("permite cancelar la edición de una mascota", () => {
    abrir("/recepcion/pacientes", recepcion);
    fireEvent.change(screen.getByRole("textbox", { name: "Mascota 2" }), {
      target: { value: "Cambio temporal" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Cancelar edición" })[1],
    );
    expect(screen.getByRole("textbox", { name: "Mascota 2" })).toHaveValue(
      "Michi",
    );
  });
});

describe("Eliminación de clientes y mascotas", () => {
  it("permite eliminar un cliente sin mascotas", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const usuarios = [
      admin,
      recepcion,
      dueno,
      {
        id: 99,
        nombre: "Cliente Sin Mascotas",
        correo: "sinmascotas@profesor.duoc.cl",
        rol: "Dueño",
        clave: "Cliente123",
        activo: true,
      },
    ];

    localStorage.setItem("vet_usuarios", JSON.stringify(usuarios));

    abrir("/admin/usuarios", admin);

    const fila = screen.getByText("sinmascotas@profesor.duoc.cl").closest("tr");

    fireEvent.click(
      within(fila).getByRole("button", { name: "Eliminar cliente" }),
    );

    const usuariosActualizados = JSON.parse(
      localStorage.getItem("vet_usuarios"),
    );

    expect(usuariosActualizados.some((u) => u.id === 99)).toBe(false);

    vi.restoreAllMocks();
  });

  it("impide eliminar un cliente con mascotas registradas", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const mascotas = [
      {
        id: 100,
        nombre: "Mascota de prueba",
        especie: "Perro",
        edad: 3,
        duenoId: 3,
        historial: [],
      },
    ];

    localStorage.setItem("vet_pacientes", JSON.stringify(mascotas));

    abrir("/admin/usuarios", admin);

    const fila = screen.getByText("cliente@profesor.duoc.cl").closest("tr");

    fireEvent.click(
      within(fila).getByRole("button", { name: "Eliminar cliente" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No puedes eliminar este cliente porque tiene mascotas registradas",
    );

    const usuarios = JSON.parse(localStorage.getItem("vet_usuarios"));

    expect(usuarios.some((u) => u.id === 3)).toBe(true);

    vi.restoreAllMocks();
  });

  it("permite eliminar una mascota al confirmar", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    abrir("/recepcion/pacientes", recepcion);

    const mascota = screen.getByRole("textbox", {
      name: "Mascota 2",
    });

    const fila = mascota.closest("tr");

    fireEvent.click(
      within(fila).getByRole("button", { name: "Eliminar mascota" }),
    );

    expect(
      screen.queryByRole("textbox", { name: "Mascota 2" }),
    ).not.toBeInTheDocument();

    const pacientes = JSON.parse(localStorage.getItem("vet_pacientes"));

    expect(pacientes.some((p) => p.id === 2)).toBe(false);

    vi.restoreAllMocks();
  });

  it("permite cancelar la eliminación de una mascota", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    abrir("/recepcion/pacientes", recepcion);

    const mascota = screen.getByRole("textbox", {
      name: "Mascota 2",
    });

    const fila = mascota.closest("tr");

    fireEvent.click(
      within(fila).getByRole("button", { name: "Eliminar mascota" }),
    );

    expect(screen.getByRole("textbox", { name: "Mascota 2" })).toHaveValue(
      "Michi",
    );

    const pacientes = JSON.parse(localStorage.getItem("vet_pacientes"));

    expect(pacientes.some((p) => p.id === 2)).toBe(true);

    vi.restoreAllMocks();
  });
});
