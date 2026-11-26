import Formulario from "./components/Formulario";
import Reportes from "./components/Reportes";
import Ficha from "./components/Ficha";
import Usuarios from "./components/Usuarios";
import Pacientes from "./components/Pacientes";

import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  correoValido,
  textoRequerido,
  validarRegistro,
  validarPerfil,
  validarRunYApellido
} from "./validaciones";
import "./App.css";
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ContentLayout from './layouts/ContentLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { mainNavigation } from './navigation.js';
import { clinica } from './data/clinica.js';
import InicioPage from './features/clinica/InicioPage.jsx';
import ServiciosPage from './features/clinica/ServiciosPage.jsx';
import UbicacionPage from './features/clinica/UbicacionPage.jsx';
import MascotasPage from './features/mascotas/MascotasPage.jsx';
import DetalleMascotaPage from './features/mascotas/DetalleMascotaPage.jsx';
import SolicitarCitaPage from './features/citas/SolicitarCitaPage.jsx';
import MisCitasPage from './features/citas/MisCitasPage.jsx';
import DetalleCitaPage from './features/citas/DetalleCitaPage.jsx';
import RecepcionSolicitudesPage from './features/citas/RecepcionSolicitudesPage.jsx';
import CatalogoPage from './catalogo/CatalogoPage.jsx';
import CarritoPage from './catalogo/CarritoPage.jsx';
import MisPedidosPage from './catalogo/MisPedidosPage.jsx';
import GestionPedidosPage from './catalogo/GestionPedidosPage.jsx';
import GestionCatalogoPage from './catalogo/GestionCatalogoPage.jsx';
import PanelPage from './features/dashboard/PanelPage.jsx';
import { EVENTO_PACIENTES, obtenerMascotas } from './data/veterinaria.js';
import { iniciarSesion, registrarDueno, verificarSesion, actualizarPerfil } from './api/auth.js';
import { listarUsuarios } from './api/usuarios.js';
import {
  EVENTO_SESION_EXPIRADA,
  cerrarSesionLocal,
  leerSesion,
  limpiarDatosLocalesAntiguos,
  notificarSesionExpirada,
} from './api/sesion.js';

const leer = (clave, defecto) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
};
const PERSONAL = ['Administrador', 'Recepcionista'];

function AppInterna() {
  // La sesión se restaura desde localStorage (token + usuario) y luego se confirma con /auth/me.
  const [sesion, setSesion] = useState(() => leerSesion()?.usuario ?? null);
  const [usuarios, setUsuarios] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
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
      { label: 'Administración', href: '/admin' },
    ] : []),
    ...(PERSONAL.includes(sesion?.rol) ? [
      { label: 'Recepción', href: '/recepcion' },
    ] : []),
    ...(sesion ? [{ label: 'Mis pedidos', href: '/mis-pedidos' }, { label: 'Carrito', href: '/carrito' }] : []),
  ];

  const recargarPacientes = useCallback(async () => {
    if (!leerSesion()) return;
    try {
      setPacientes(await obtenerMascotas());
    } catch (error) {
      if (error.status !== 401) setMensaje(error.message);
    }
  }, []);

  const recargarUsuarios = useCallback(async () => {
    if (!PERSONAL.includes(leerSesion()?.usuario?.rol)) {
      setUsuarios([]);
      return;
    }
    try {
      setUsuarios(await listarUsuarios());
    } catch (error) {
      if (error.status !== 401) setMensaje(error.message);
    }
  }, []);

  // 1) Al montar: limpia datos de la versión anterior y valida la sesión guardada con el backend.
  useEffect(() => {
    limpiarDatosLocalesAntiguos();
    if (!leerSesion()) return;
    verificarSesion()
      .then((usuario) => setSesion(usuario))
      .catch((error) => {
        // 401 ya lo maneja el evento de sesión expirada; otros errores (red) conservan la sesión.
        if (error.status !== 401) setMensaje(error.message);
      });
  }, []);

  // 2) Sesión vencida o rechazada por el backend: se cierra y se vuelve al login con el motivo.
  useEffect(() => {
    const alExpirar = (evento) => {
      setSesion(null);
      setUsuarios([]);
      setPacientes([]);
      setMensaje(evento.detail || 'Tu sesión expiró. Inicia sesión nuevamente.');
      navegar('/login', { replace: true });
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, [navegar]);

  // 3) Temporizador: cierra la sesión justo cuando vence el JWT, aunque no haya peticiones.
  useEffect(() => {
    if (!sesion) return;
    const guardada = leerSesion();
    if (!guardada) {
      notificarSesionExpirada();
      return;
    }
    const restante = Math.min(guardada.expiraEn - Date.now(), 2147483647);
    const temporizador = setTimeout(() => notificarSesionExpirada(), Math.max(restante, 0));
    return () => clearTimeout(temporizador);
  }, [sesion]);

  // 4) Datos compartidos según el rol (el backend vuelve a filtrar por rol).
  useEffect(() => {
    if (!sesion) return;
    recargarPacientes();
    recargarUsuarios();
  }, [sesion, recargarPacientes, recargarUsuarios]);

  useEffect(() => {
    window.addEventListener(EVENTO_PACIENTES, recargarPacientes);
    return () => window.removeEventListener(EVENTO_PACIENTES, recargarPacientes);
  }, [recargarPacientes]);

  const ir = (ruta) => {
    setMensaje("");
    navegar(ruta);
  };
  const cerrarSesion = () => {
    cerrarSesionLocal();
    setSesion(null);
    setUsuarios([]);
    setPacientes([]);
    ir("/login");
  };
  const entrar = async (correo = "", clave = "") => {
    if (!correoValido(correo) || !textoRequerido(clave)) {
      setMensaje("Credenciales inválidas o usuario desactivado");
      return;
    }
    setEnviando(true);
    try {
      const usuario = await iniciarSesion(correo, clave);
      setSesion(usuario);
      ir(
        usuario.rol === "Administrador"
          ? "/admin"
          : usuario.rol === "Recepcionista"
            ? "/recepcion"
            : "/inicio",
      );
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setEnviando(false);
    }
  };
  const registrar = async (datos) => {
    const error = validarRegistro(datos) || validarRunYApellido(datos);
    if (error) {
      setMensaje(error);
      return;
    }
    setEnviando(true);
    try {
      await registrarDueno(datos);
      setMensaje("Cuenta creada. Ingresa con tu correo y contraseña.");
      navegar("/login");
    } catch (fallo) {
      setMensaje(fallo.message);
    } finally {
      setEnviando(false);
    }
  };
  return (
    <Routes>
      <Route element={<AuthLayout message={mensaje} />}>
        <Route
          path="/login"
          element={
            sesion ? <Navigate to="/inicio" replace /> :
            <Formulario
              key="login"
              titulo="Iniciar sesión"
              campos={[
                ["correo", "Correo electrónico", "email"],
                ["clave", "Contraseña", "password"],
              ]}
              boton={enviando ? "Ingresando..." : "Ingresar"}
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
                ["run", "RUN (ej. 12345678-5)"],
                ["nombre", "Nombre"],
                ["apellido", "Apellido"],
                ["correo", "Correo electrónico", "email"],
                ["telefono", "Teléfono"],
                ["clave", "Contraseña", "password"],
              ]}
              boton={enviando ? "Creando cuenta..." : "Crear cuenta"}
              enviar={registrar}
              pie={
                <p>
                  ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
              }
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
              path="/perfil"
              element={
                <section className="tarjeta">
                  <h1>Mi perfil</h1>
                  <p>{sesion?.correo} · {sesion?.rol} · RUN {sesion?.run}</p>
                  <Formulario
                    key={sesion?.id}
                    titulo="Actualizar mis datos"
                    inicial={sesion || {}}
                    campos={[
                      ["nombre", "Nombre"],
                      ["apellido", "Apellido"],
                      ["telefono", "Teléfono"],
                    ]}
                    boton="Guardar cambios"
                    enviar={async (d) => {
                      const fallo = validarPerfil(d);
                      if (fallo || !textoRequerido(d.apellido)) {
                        setMensaje(fallo || "Ingresa tu apellido");
                        return;
                      }
                      try {
                        setSesion(await actualizarPerfil(d));
                        setMensaje("Perfil actualizado");
                      } catch (error) {
                        setMensaje(error.message);
                      }
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
                    {clinica.direccion}
                  </p>
                  <Link to="/ubicacion">Ver mapa e indicaciones</Link>
                  <Formulario
                    key="contacto"
                    titulo="Formulario de contacto"
                    campos={[
                      ["nombre", "Nombre"],
                      ["correo", "Correo", "email"],
                      ["consulta", "Consulta", "textarea"],
                    ]}
                    boton="Enviar consulta"
                    enviar={(d) => {
                      if (!textoRequerido(d.nombre) || !textoRequerido(d.consulta) || !correoValido(d.correo)) {
                        setMensaje('Completa los datos correctamente');
                        return;
                      }
                      try {
                        const guardadas = leer('vet_consultas', []);
                        const consultas = Array.isArray(guardadas) ? guardadas : [];
                        localStorage.setItem('vet_consultas', JSON.stringify([...consultas, {
                          ...d, id: Date.now(), usuarioId: sesion.id, fecha: new Date().toISOString(),
                        }]));
                        setMensaje('Consulta registrada');
                      } catch { setMensaje('No se pudo guardar la consulta. Inténtalo nuevamente.'); }
                    }}
                  />
                </section>
              }
            />
          </Route>
          <Route element={<ContentLayout variant="feature" />}>
            <Route path="/inicio" element={<InicioPage usuario={sesion} pacientes={pacientes} />} />
            <Route path="/servicios" element={<ServiciosPage usuario={sesion} />} />
            <Route path="/ubicacion" element={<UbicacionPage />} />
            <Route path="/catalogo" element={<CatalogoPage key={sesion?.id} />} />
            <Route path="/carrito" element={<CarritoPage key={sesion?.id} />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage key={sesion?.id} />} />
            <Route path="/mis-citas" element={<MisCitasPage />} />
            <Route path="/mis-citas/:id" element={<DetalleCitaPage key={pathname} />} />
            <Route element={<ProtectedRoute user={sesion} roles={['Dueño']} />}>
              <Route path="/mascotas" element={<MascotasPage />} />
              <Route path="/mascotas/:id" element={<DetalleMascotaPage key={pathname} />} />
              <Route path="/citas/nueva" element={<SolicitarCitaPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute user={sesion} roles={PERSONAL} />}>
            <Route element={<DashboardLayout title="Panel de recepción" homePath="/recepcion" />}>
              <Route element={<ContentLayout />}>
                <Route
                  path="/recepcion/pacientes"
                  element={
                    <Pacientes
                      pacientes={pacientes}
                      recargar={recargarPacientes}
                      usuarios={usuarios}
                      ir={ir}
                    />
                  }
                />
                <Route path="/recepcion/pacientes/:id" element={<Ficha pacientes={pacientes} recargar={recargarPacientes} />} />
              </Route>
              <Route element={<ContentLayout variant="feature" />}>
                <Route path="/recepcion" element={<PanelPage tipo="recepcion" usuario={sesion} usuarios={usuarios} pacientes={pacientes} />} />
                <Route path="/recepcion/solicitudes" element={<RecepcionSolicitudesPage />} />
                <Route path="/recepcion/pedidos" element={<GestionPedidosPage />} />
              </Route>
            </Route>
          </Route>
          <Route element={<ProtectedRoute user={sesion} roles={['Administrador']} />}>
            <Route element={<DashboardLayout title="Panel de administración" homePath="/admin" />}>
              <Route element={<ContentLayout />}>
                <Route
                  path="/admin/usuarios"
                  element={
                    <Usuarios
                      usuarios={usuarios}
                      recargar={recargarUsuarios}
                      setMensaje={setMensaje}
                      sesion={sesion}
                      pacientes={pacientes}
                    />
                  }
                />
                <Route path="/admin/reportes" element={<Reportes pacientes={pacientes} usuarios={usuarios} />} />
                <Route path="/admin/catalogo" element={<GestionCatalogoPage />} />
              </Route>
              <Route element={<ContentLayout variant="feature" />}>
                <Route path="/admin" element={<PanelPage tipo="admin" usuario={sesion} usuarios={usuarios} pacientes={pacientes} />} />
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
