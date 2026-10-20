
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

function App() {
  const [count, setCount] = useState(0)

import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate
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
  const [sesion, setSesion] = useState(() => leer("vet_sesion", null));
  const [mensaje, setMensaje] = useState("");
  const navegar = useNavigate();
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
        (u) => u.correo.toLowerCase() === datos.correo.toLowerCase(),
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
      <Header />
      <main id="contenido" className="site-container site-main" tabIndex={-1}>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

            <button type="button" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        )}
      {mensaje && (
        <div role="alert" className="alerta">
          {mensaje}
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
      </main>
      <Footer />
    </>
  )
}
