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
import { usuariosIniciales } from "./datos";
import {
  correoValido,
  correoValidoParaRol,
  claveValida,
  textoRequerido,
  validarRegistro,
  validarPerfil
} from "./validaciones";
import "./App.css";
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ContentLayout from './layouts/ContentLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { mainNavigation } from './navigation.js';
import { servicios } from './catalogo.js';
import MascotasPage from './features/mascotas/MascotasPage.jsx';
import DetalleMascotaPage from './features/mascotas/DetalleMascotaPage.jsx';
import SolicitarCitaPage from './features/citas/SolicitarCitaPage.jsx';
import MisCitasPage from './features/citas/MisCitasPage.jsx';
import DetalleCitaPage from './features/citas/DetalleCitaPage.jsx';
import RecepcionSolicitudesPage from './features/citas/RecepcionSolicitudesPage.jsx';
import CatalogoPage from './catalogo/CatalogoPage.jsx';
import CarritoPage from './catalogo/CarritoPage.jsx';
import { EVENTO_PACIENTES, leerPacientesCompartidos } from './data/veterinaria.js';
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
    leerPacientesCompartidos(),
  );
  const [sesionGuardada, setSesion] = useState(() => leer("vet_sesion", null));
  const sesion = usuarios.find((usuario) => usuario.id === sesionGuardada?.id && usuario.activo) || null;
  const [mensaje, setMensaje] = useState("");
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const roles = ['Administrador', 'Recepcionista', 'Dueño'];
  const enlaces = [
    ...mainNavigation,
    ...(sesion ? [{ label: 'Catálogo', href: '/catalogo' }] : []),
    ...(sesion?.rol === 'Dueño' ? [
      { label: 'Mis mascotas', href: '/mascotas' }, { label: 'Solicitar cita', href: '/citas/nueva' }, { label: 'Mis citas', href: '/mis-citas' },
    ] : []),
    ...(sesion?.rol === 'Administrador' ? [
      { label: 'Usuarios', href: '/admin/usuarios' },
      { label: 'Reportes', href: '/admin/reportes' },
    ] : []),
    ...(['Administrador', 'Recepcionista'].includes(sesion?.rol) ? [
      { label: 'Pacientes', href: '/recepcion/pacientes' },
      { label: 'Solicitudes', href: '/recepcion/solicitudes' },
    ] : []),
    ...(sesion ? [{ label: 'Carrito', href: '/carrito' }] : []),
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
  useEffect(() => {
    const sincronizar = () => setPacientes(leerPacientesCompartidos());
    window.addEventListener(EVENTO_PACIENTES, sincronizar);
    return () => window.removeEventListener(EVENTO_PACIENTES, sincronizar);
  }, []);
  const ir = (ruta) => {
    setMensaje("");
    navegar(ruta);
  };
  const cerrarSesion = () => {
    setSesion(null);
    localStorage.removeItem("vet_sesion");
    ir("/login");
  };
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
    <Routes>
      <Route element={<AuthLayout message={mensaje} />}>
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
      </Route>
      <Route
        element={
          <MainLayout
            navigation={enlaces}
            user={sesion ? { id: sesion.id, name: sesion.nombre } : null}
            onLogout={cerrarSesion}
            onLogin={() => ir('/login')}
            message={mensaje}
          />
        }
      >
        <Route path="/" element={<Navigate to={sesion ? "/inicio" : "/login"} replace />} />
        <Route element={<ProtectedRoute user={sesion} roles={roles} />}>
          <Route element={<ContentLayout />}>
            <Route
              path="/inicio"
              element={
                <section className="tarjeta">
                  <h1>Bienvenido a Veterinaria San Marcos</h1>
                  <p>Hola, {sesion?.nombre}. Consulta tu perfil y accede a las opciones disponibles para tu rol.</p>
                  <Link className="site-button" to="/perfil">Ver mi perfil</Link>
                </section>
              }
            />
            <Route
              path="/servicios"
              element={
                <section className="tarjeta">
                  <h1>Servicios veterinarios</h1>
                  <p>Catálogo de demostración del proyecto.</p>
                  <ul className="grid gap-4 md:grid-cols-2">
                    {servicios.map(servicio => <li className="rounded-xl border border-[var(--border)] p-4" key={servicio.codigo}>
                      <h2>{servicio.nombre}</h2><p>{servicio.especie}</p>
                    </li>)}
                  </ul>
                </section>
              }
            />
            <Route
              path="/ubicacion"
              element={
                <section className="tarjeta">
                  <h1>Ubicación de la clínica</h1>
                  <p>Rancagua, Región de O’Higgins.</p>
                  <p>La dirección exacta y el mapa se incorporarán cuando el equipo confirme la ubicación.</p>
                  <Link to="/contacto">Contactar a la clínica</Link>
                </section>
              }
            />
            <Route
              path="/perfil"
              element={
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
                            {x.nombre} · {x.especie} · {(x.historial || []).length}{" "}
                            atenciones registradas
                          </p>
                        ))}
                    </>
                  )}
                </section>
              }
            />
            <Route
              path="/contacto"
              element={
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
              }
            />
          </Route>
          <Route element={<ContentLayout variant="feature" />}>
            <Route path="/catalogo" element={<CatalogoPage key={sesion?.id} />} />
            <Route path="/carrito" element={<CarritoPage key={sesion?.id} />} />
            <Route path="/mis-citas" element={<MisCitasPage />} />
            <Route path="/mis-citas/:id" element={<DetalleCitaPage key={pathname} />} />
            <Route element={<ProtectedRoute user={sesion} roles={['Dueño']} />}>
              <Route path="/mascotas" element={<MascotasPage />} />
              <Route path="/mascotas/:id" element={<DetalleMascotaPage key={pathname} />} />
              <Route path="/citas/nueva" element={<SolicitarCitaPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute user={sesion} roles={['Administrador', 'Recepcionista']} />}>
            <Route element={<DashboardLayout title="Panel de recepción" />}>
              <Route element={<ContentLayout />}>
                <Route path="/recepcion" element={<Navigate to="/recepcion/pacientes" replace />} />
                <Route
                  path="/recepcion/pacientes"
                  element={
                    <Pacientes
                      pacientes={pacientes}
                      setPacientes={setPacientes}
                      usuarios={usuarios}
                      ir={ir}
                    />
                  }
                />
                <Route path="/recepcion/pacientes/:id" element={<Ficha pacientes={pacientes} setPacientes={setPacientes} />} />
              </Route>
              <Route element={<ContentLayout variant="feature" />}>
                <Route path="/recepcion/solicitudes" element={<RecepcionSolicitudesPage />} />
              </Route>
            </Route>
          </Route>
          <Route element={<ProtectedRoute user={sesion} roles={['Administrador']} />}>
            <Route element={<DashboardLayout title="Panel de administración" />}>
              <Route element={<ContentLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/usuarios" replace />} />
                <Route
                  path="/admin/usuarios"
                  element={
                    <Usuarios
                      usuarios={usuarios}
                      setUsuarios={setUsuarios}
                      setMensaje={setMensaje}
                      sesion={sesion}
                      pacientes={pacientes}
                    />
                  }
                />
                <Route path="/admin/reportes" element={<Reportes pacientes={pacientes} usuarios={usuarios} />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route element={<ContentLayout />}>
          <Route
            path="*"
            element={
              <section className="tarjeta">
                <h1>Página no encontrada</h1>
                <Link to="/">Volver</Link>
              </section>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AppInterna />
    </BrowserRouter>
  );
}
