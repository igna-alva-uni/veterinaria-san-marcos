import Formulario from "./components/Formulario";
import Reportes from "./components/Reportes";
import Ficha from "./components/Ficha";
import Usuarios from "./components/Usuarios";
import Pacientes from "./components/Pacientes";

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation
} from "react-router-dom";
import { usuariosIniciales, pacientesIniciales } from "./datos";
import {
  correoValido,
  correoValidoParaRol,
  claveValida,
  textoRequerido,
  validarRegistro,
  validarPerfil
} from "./validaciones";
import "./App.css";
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { mainNavigation } from './navigation.js';
import { servicios } from './catalogo.js';
const leer = (clave, defecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
};
function AppInterna() {
  const [usuarios, setUsuarios] = useState(() =>
    leer("vet_usuarios", usuariosIniciales),
  );
  const [pacientes, setPacientes] = useState(() =>
    leer("vet_pacientes", pacientesIniciales),
  );
  const [sesionGuardada, setSesion] = useState(() => leer("vet_sesion", null));
  const sesion = usuarios.find((usuario) => usuario.id === sesionGuardada?.id && usuario.activo) || null;
  const [mensaje, setMensaje] = useState("");
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const esAutenticacion = pathname === '/login' || pathname === '/registro';
  const roles = ['Administrador', 'Recepcionista', 'Dueño'];
  const enlaces = [
    ...mainNavigation,
    ...(sesion ? [{ label: 'Mi perfil', href: '/perfil' }] : []),
    ...(sesion?.rol === 'Administrador' ? [
      { label: 'Usuarios', href: '/admin/usuarios' },
      { label: 'Reportes', href: '/admin/reportes' },
    ] : []),
    ...(['Administrador', 'Recepcionista'].includes(sesion?.rol) ? [
      { label: 'Pacientes', href: '/recepcion/pacientes' },
    ] : []),
  ];
  useEffect(
    () => localStorage.setItem("vet_usuarios", JSON.stringify(usuarios)),
    [usuarios],
  );
  useEffect(
    () => localStorage.setItem("vet_pacientes", JSON.stringify(pacientes)),
    [pacientes],
  );
  useEffect(
    () => localStorage.setItem("vet_sesion", JSON.stringify(sesion)),
    [sesion],
  );
  const ir = (ruta) => {
    setMensaje("");
    navegar(ruta);
  };
  const cerrarSesion = () => {
    setSesion(null);
    localStorage.removeItem("vet_sesion");
    ir("/login");
  };
  const acceso = (roles, componente) =>
    !sesion ? (
      <Navigate to="/login" replace />
    ) : roles.includes(sesion.rol) ? (
      componente
    ) : (
      <p className="alerta">
        Acceso denegado: tu rol no tiene permiso para esta vista.
      </p>
    );
  const entrar = (correo = "", clave = "") => {
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase().trim() && u.activo,
    );
    if (
      !usuario ||
      !correoValidoParaRol(correo, usuario.rol) ||
      !claveValida(clave) ||
      usuario.clave !== clave
    ) {
      setMensaje("Credenciales inválidas o usuario desactivado");
      return;
    }
    setSesion(usuario);
    ir(
      usuario.rol === "Administrador"
        ? "/admin/usuarios"
        : usuario.rol === "Recepcionista"
          ? "/recepcion/pacientes"
          : "/perfil",
    );
  };
  const registrar = (datos) => {
    const error = validarRegistro(datos);
    if (error) {
      setMensaje(error);
      return;
    }
    if (
      usuarios.some(
        (u) => u.correo.toLowerCase() === datos.correo.trim().toLowerCase(),
      )
    ) {
      setMensaje("Correo ya registrado");
      return;
    }
    const nuevo = {
      id: Date.now(),
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      telefono: datos.telefono,
      clave: datos.clave,
      rol: "Dueño",
      activo: true,
    };
    setUsuarios((v) => [...v, nuevo]);
    setMensaje(
      "Registro de demostración creado. Ingresa con tu correo y contraseña.",
    );
    navegar("/login");
  };
  return (
    <>
      {!esAutenticacion && <Header navigation={enlaces} activePath={pathname}
        user={sesion ? { name: sesion.nombre } : null}
        onLogout={cerrarSesion} onLogin={() => ir('/login')} />}
      <main id="contenido" className={`site-container site-main ${esAutenticacion ? 'auth-module' : ''}`} tabIndex={-1}>
      <div className="vet-module">
      {mensaje && (
        <div role="alert" className="alerta">
          {mensaje}
        </div>
      )}
      <Routes>
        <Route path="/inicio" element={acceso(roles,
          <section className="tarjeta">
            <h1>Bienvenido a Veterinaria San Marcos</h1>
            <p>Hola, {sesion?.nombre}. Consulta tu perfil y accede a las opciones disponibles para tu rol.</p>
            <Link className="site-button" to="/perfil">Ver mi perfil</Link>
          </section>
        )} />
        <Route path="/servicios" element={acceso(roles,
          <section className="tarjeta">
            <h1>Servicios veterinarios</h1>
            <p>Catálogo de demostración del proyecto.</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {servicios.map(servicio => <li className="rounded-xl border border-[var(--border)] p-4" key={servicio.codigo}>
                <h2>{servicio.nombre}</h2><p>{servicio.especie}</p>
              </li>)}
            </ul>
          </section>
        )} />
        <Route path="/ubicacion" element={acceso(roles,
          <section className="tarjeta">
            <h1>Ubicación de la clínica</h1>
            <p>Rancagua, Región de O’Higgins.</p>
            <p>La dirección exacta y el mapa se incorporarán cuando el equipo confirme la ubicación.</p>
            <Link to="/contacto">Contactar a la clínica</Link>
          </section>
        )} />
        <Route path="/admin" element={acceso(['Administrador'], <Navigate to="/admin/usuarios" replace />)} />
        <Route path="/recepcion" element={acceso(['Administrador', 'Recepcionista'], <Navigate to="/recepcion/pacientes" replace />)} />
        <Route
          path="/"
          element={<Navigate to={sesion ? "/inicio" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={
            <Formulario
              key="login"
              titulo="Iniciar sesión"
              campos={[
                ["correo", "Correo electrónico", "email"],
                ["clave", "Contraseña", "password"],
              ]}
              boton="Ingresar"
              enviar={(d) => entrar(d.correo, d.clave)}
              pie={
                <p>
                  ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
                </p>
              }
            />
          }
        />
        <Route
          path="/registro"
          element={
            <Formulario
              key="registro"
              titulo="Registro de dueño de mascota"
              campos={[
                ["nombre", "Nombre completo"],
                ["correo", "Correo electrónico", "email"],
                ["telefono", "Teléfono"],
                ["clave", "Contraseña", "password"],
              ]}
              boton="Crear cuenta"
              enviar={registrar}
            />
          }
        />
        <Route
          path="/perfil"
          element={acceso(
            ["Administrador", "Recepcionista", "Dueño"],
            <section className="tarjeta">
              <h1>Mi perfil</h1>
              <Formulario
                key={sesion?.id}
                titulo="Actualizar mis datos"
                inicial={sesion || {}}
                campos={[
                  ["nombre", "Nombre"],
                  ["telefono", "Teléfono"],
                ]}
                boton="Guardar cambios"
                enviar={(d) => {
                  const fallo = validarPerfil(d);
                  if (fallo) {
                    setMensaje(fallo);
                    return;
                  }
                  const actualizado = {
                    ...sesion,
                    nombre: d.nombre.trim(),
                    telefono: d.telefono,
                  };
                  setSesion(actualizado);
                  setUsuarios((v) =>
                    v.map((u) => (u.id === actualizado.id ? actualizado : u)),
                  );
                  setMensaje("Perfil actualizado");
                }}
              />
              {sesion?.rol === "Dueño" && (
                <>
                  <h2>Mis mascotas</h2>
                  {pacientes
                    .filter((x) => x.duenoId === sesion.id)
                    .map((x) => (
                      <p key={x.id}>
                        {x.nombre} · {x.especie} · {x.historial.length}{" "}
                        atenciones registradas
                      </p>
                    ))}
                </>
              )}
            </section>,
          )}
        />
        <Route
          path="/admin/usuarios"
          element={acceso(
            ["Administrador"],
            <Usuarios
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              setMensaje={setMensaje}
              sesion={sesion}
              pacientes={pacientes}
            />,
          )}
        />
        <Route
          path="/recepcion/pacientes"
          element={acceso(
            ["Administrador", "Recepcionista"],
            <Pacientes
              pacientes={pacientes}
              setPacientes={setPacientes}
              usuarios={usuarios}
              ir={ir}
            />,
          )}
        />
        <Route
          path="/recepcion/pacientes/:id"
          element={acceso(
            ["Administrador", "Recepcionista"],
            <Ficha pacientes={pacientes} setPacientes={setPacientes} />,
          )}
        />
        <Route
          path="/admin/reportes"
          element={acceso(
            ["Administrador"],
            <Reportes pacientes={pacientes} usuarios={usuarios} />,
          )}
        />
        <Route
          path="/contacto"
          element={acceso(roles,
            <section className="tarjeta">
              <h1>Contacto</h1>
              <p>Veterinaria San Marcos · Rancagua, Chile.</p>
              <p>
                Dirección y teléfono oficiales pendientes de confirmación por el
                equipo.
              </p>
              <Formulario
                key="contacto"
                titulo="Formulario de contacto (demostración)"
                campos={[
                  ["nombre", "Nombre"],
                  ["correo", "Correo", "email"],
                  ["consulta", "Consulta", "textarea"],
                ]}
                boton="Enviar consulta"
                enviar={(d) =>
                  setMensaje(
                    textoRequerido(d.consulta) && correoValido(d.correo)
                      ? "Consulta registrada solo en esta demostración"
                      : "Completa los datos correctamente",
                  )
                }
              />
            </section>
          )}
        />
        <Route
          path="*"
          element={
            <section className="tarjeta">
              <h1>Página no encontrada</h1>
              <Link to="/">Volver</Link>
            </section>
          }
        />
      </Routes>
      </div>
      </main>
      {!esAutenticacion && <Footer />}
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AppInterna />
    </BrowserRouter>
  );
}
