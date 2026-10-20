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
      screen.getByRole("heading", { name: "Resumen de administración" }),
    ).toBeInTheDocument();
  });
  it("permite acceso a recepción", () => {
    abrir();
    ingresar("recepcion@gmail.com", "Recepcion123");
    expect(
      screen.getByRole("heading", { name: "Resumen de recepción" }),
    ).toBeInTheDocument();
  });
  it("lleva al dueño a Inicio después de iniciar sesión", () => {
    abrir();
    ingresar("cliente@profesor.duoc.cl", "Cliente123");
    expect(
      screen.getByRole("heading", { name: /Cuidamos a quienes/ }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/inicio");
    expect(screen.getByRole("heading", { name: "Mis mascotas" })).toBeInTheDocument();
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
    abrir("/contacto", dueno);
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

describe('Integración de navegación y sesión', () => {
  it('conecta el header con el usuario y navega a servicios sin perder la sesión', () => {
    abrir('/perfil', dueno);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', {name:'Ver perfil de Cliente'})).toBeInTheDocument();
    expect(within(header).queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
    fireEvent.click(within(header).getByRole('link', { name: 'Servicios' }));
    expect(screen.getByRole('heading', { name: 'Servicios veterinarios' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/servicios');
    expect(within(header).getByRole('link', { name: 'Servicios' })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(within(header).getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
  it('no conserva la contraseña al pasar de login a registro', () => {
    abrir();
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Temporal123' } });
    fireEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  });
  it('rechaza una sesión persistida de una cuenta desactivada', () => {
    localStorage.setItem('vet_usuarios', JSON.stringify([admin, recepcion, { ...dueno, activo: false }]));
    abrir('/perfil', dueno);
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
  it('protege la vista de contacto sin sesión', () => {
    abrir('/contacto');
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
  it('incluye navegación administrativa y cierra el menú con Escape', () => {
    abrir('/admin/usuarios', admin);
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Administración' })).toBeInTheDocument();
    const toggle = within(header).getByRole('button', { name: 'Abrir menú de navegación' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});

describe('Rutas integradas de mascotas, citas y catálogo', () => {
  it('conecta Mis mascotas con los pacientes existentes y la navegación compartida', () => {
    abrir('/mascotas', dueno);
    expect(screen.getByRole('heading', {name:'Mis mascotas',exact:true})).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', {name:'Navegación principal'})).getByRole('link', {name:'Solicitar cita'})).toBeInTheDocument();
  });
  it('protege recepción frente al dueño y los módulos nuevos frente a visitantes', () => {
    abrir('/recepcion/solicitudes', dueno);
    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument();
    cleanup();
    localStorage.clear();
    abrir('/catalogo');
    expect(screen.getByRole('heading', {name:'Iniciar sesión'})).toBeInTheDocument();
  });
  it('mantiene la cantidad de un servicio en uno al agregarlo dos veces', () => {
    abrir('/catalogo', dueno);
    const tarjeta = screen.getByRole('heading', {name:'Consulta general',exact:true}).closest('article');
    const agregar = within(tarjeta).getByRole('button', {name:/Agregar/});
    fireEvent.click(agregar);
    fireEvent.click(agregar);
    expect(JSON.parse(localStorage.getItem('vsm-carrito:3')).find(p=>p.codigo==='SV001').cantidad).toBe(1);
    fireEvent.click(within(screen.getByRole('banner')).getByRole('link',{name:'Carrito, 1 elemento',exact:true}));
    expect(screen.getByRole('heading',{name:'Mi carrito'})).toBeInTheDocument();
    expect(screen.getByText('1 servicio')).toBeInTheDocument();
  });
});

describe('Accesos de carrito y perfil en el navbar', () => {
  it.each([admin, recepcion, dueno])('deja el carrito al final y mueve el perfil al nombre de $nombre', (usuario) => {
    abrir('/inicio', usuario);
    const nav = screen.getByRole('navigation', {name:'Navegación principal'});
    const lista = within(nav).getByRole('list');
    expect(within(lista).getAllByRole('link').at(-1)).toHaveAccessibleName('Carrito');
    expect(within(lista).queryByRole('link', {name:'Mi perfil'})).not.toBeInTheDocument();
    const perfil = within(nav).getByRole('link', {name:`Ver perfil de ${usuario.nombre}`});
    expect(perfil.querySelector('svg')).not.toBeNull();
    fireEvent.click(perfil);
    expect(screen.getByRole('heading', {name:'Mi perfil'})).toBeInTheDocument();
    expect(perfil).toHaveAttribute('aria-current', 'page');
  });
  it('actualiza el contador al agregar, cambiar cantidades y vaciar sin recargar', () => {
    abrir('/catalogo', dueno);
    const header = screen.getByRole('banner');
    const carritoVacio = within(header).getByRole('link', {name:'Carrito',exact:true});
    expect(carritoVacio).toHaveTextContent('Carrito');
    expect(carritoVacio.querySelector('svg')).not.toBeNull();
    const tarjeta = screen.getByRole('heading', {name:'Amoxibay 250mg',exact:true}).closest('article');
    const agregar = within(tarjeta).getByRole('button', {name:/Agregar/});
    fireEvent.click(agregar);
    expect(within(header).getByRole('link',{name:'Carrito, 1 elemento'})).toHaveTextContent('1');
    fireEvent.click(agregar);
    const carrito = within(header).getByRole('link',{name:'Carrito, 2 elementos'});
    expect(carrito).toHaveTextContent('2');
    expect(carrito).not.toHaveTextContent('Carrito');
    fireEvent.click(carrito);
    fireEvent.click(screen.getByRole('button',{name:'Disminuir cantidad de Amoxibay 250mg'}));
    expect(within(header).getByRole('link',{name:'Carrito, 1 elemento'})).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button',{name:'Vaciar carrito',exact:true}));
    fireEvent.click(screen.getByRole('button',{name:'Sí, vaciar',exact:true}));
    expect(within(header).getByRole('link',{name:'Carrito',exact:true})).toHaveTextContent('Carrito');
  });
});

describe('Layouts y rutas anidadas', () => {
  it('usa AuthLayout en registro sin repetir la estructura de la aplicación', () => {
    const { container } = abrir('/registro');
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(container.querySelector('header')).toBeNull();
    expect(container.querySelector('footer')).toBeNull();
    expect(container.querySelector('.auth-module')).not.toBeNull();
  });
  it.each([
    ['/admin/usuarios', admin, 'Panel de administración'],
    ['/admin/reportes', admin, 'Panel de administración'],
    ['/recepcion/pacientes', recepcion, 'Panel de recepción'],
    ['/recepcion/solicitudes', recepcion, 'Panel de recepción'],
  ])('anida %s sin duplicar Header, Footer ni main', (ruta, usuario, titulo) => {
    const { container } = abrir(ruta, usuario);
    expect(screen.getByRole('region', {name:titulo})).toBeInTheDocument();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(container.querySelectorAll('.site-header')).toHaveLength(1);
    expect(container.querySelectorAll('.site-footer')).toHaveLength(1);
  });
  it('rechaza a recepción en todo el grupo administrativo', () => {
    abrir('/admin/reportes', recepcion);
    expect(screen.getByRole('alert')).toHaveTextContent('Acceso denegado');
    expect(screen.queryByRole('region', {name:'Panel de administración'})).not.toBeInTheDocument();
  });
  it('redirige una visita sin sesión antes de renderizar el dashboard', () => {
    abrir('/recepcion/solicitudes');
    expect(screen.getByRole('heading', {name:'Iniciar sesión'})).toBeInTheDocument();
    expect(screen.queryByRole('region', {name:'Panel de recepción'})).not.toBeInTheDocument();
  });
  it('muestra la página 404 dentro de MainLayout', () => {
    const { container } = abrir('/ruta-inexistente', dueno);
    expect(screen.getByRole('heading', {name:'Página no encontrada'})).toBeInTheDocument();
    expect(container.querySelectorAll('.site-header')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(container.querySelectorAll('.site-footer')).toHaveLength(1);
  });
});

describe('Acceso a las portadas de los paneles', () => {
  it('abre administración desde el navbar y conserva el acceso a la gestión', () => {
    abrir('/inicio', admin);
    fireEvent.click(within(screen.getByRole('banner')).getByRole('link',{name:'Administración',exact:true}));
    expect(window.location.pathname).toBe('/admin');
    expect(screen.getByRole('heading',{name:'Resumen de administración'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'Cerrar sesión'}));
    expect(screen.getByRole('heading',{name:'Iniciar sesión'})).toBeInTheDocument();
  });
  it('rechaza al dueño en la portada administrativa', () => {
    abrir('/admin',dueno);
    expect(screen.getByRole('alert')).toHaveTextContent('Acceso denegado');
    expect(screen.queryByRole('heading',{name:'Resumen de administración'})).not.toBeInTheDocument();
  });
  it('guarda una consulta de contacto antes de confirmar su registro', () => {
    abrir('/contacto',dueno);
    fireEvent.change(screen.getByLabelText('Nombre'),{target:{value:'Cliente'}});
    fireEvent.change(screen.getByLabelText('Correo'),{target:{value:'cliente@profesor.duoc.cl'}});
    fireEvent.change(screen.getByLabelText('Consulta'),{target:{value:'Necesito consultar un horario'}});
    fireEvent.click(screen.getByRole('button',{name:'Enviar consulta'}));
    expect(screen.getByRole('alert')).toHaveTextContent('Consulta registrada');
    expect(JSON.parse(localStorage.getItem('vet_consultas'))).toEqual(expect.arrayContaining([expect.objectContaining({usuarioId:3,consulta:'Necesito consultar un horario'})]));
  });
});
