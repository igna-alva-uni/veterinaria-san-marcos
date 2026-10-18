import { describe, it, expect } from "vitest";
import {
  correoValido,
  correoValidoParaRol,
  claveValida,
  validarRegistro,
  telefonoValido,
} from "./validaciones";
describe("Validaciones de formularios", () => {
  it("acepta un correo válido", () =>
    expect(correoValido("cliente@correo.cl")).toBe(true));
  it("rechaza correo sin arroba", () =>
    expect(correoValido("incorrecto.cl")).toBe(false));
  it("requiere al menos ocho caracteres", () => {
    expect(claveValida("1234567")).toBe(false);
    expect(claveValida("12345678")).toBe(true);
  });
  it("rechaza un nombre vacío", () =>
    expect(
      validarRegistro({
        nombre: "",
        correo: "a@profesor.duoc.cl",
        clave: "12345678",
      }),
    ).toBe("Ingresa tu nombre"));
  it("acepta registro válido", () =>
    expect(
      validarRegistro({
        nombre: "Ana",
        correo: "ana@profesor.duoc.cl",
        clave: "12345678",
      }),
    ).toBe(""));
  it("valida teléfono opcional", () => {
    expect(telefonoValido("")).toBe(true);
    expect(telefonoValido("abc")).toBe(false);
  });
});

import {
  validarPerfil,
  validarPaciente,
  validarAtencion,
} from "./validaciones";
describe("Validaciones adicionales del módulo", () => {
  it("rechaza perfil sin nombre", () =>
    expect(validarPerfil({ nombre: "  " })).toBe("Ingresa tu nombre"));
  it("rechaza edades negativas", () =>
    expect(
      validarPaciente({
        nombre: "Luna",
        especie: "Perro",
        edad: -1,
        duenoId: 3,
      }),
    ).toContain("edad"));
  it("requiere dueño", () =>
    expect(
      validarPaciente({
        nombre: "Luna",
        especie: "Perro",
        edad: 2,
        duenoId: "",
      }),
    ).toContain("dueño"));
  it("acepta paciente válido", () =>
    expect(
      validarPaciente({
        nombre: "Luna",
        especie: "Perro",
        edad: 2,
        duenoId: 3,
      }),
    ).toBe(""));
  it("rechaza atención futura", () =>
    expect(
      validarAtencion(
        { fecha: "2099-01-01", diagnostico: "Control" },
        "2026-10-17",
      ),
    ).toContain("fecha"));
  it("rechaza control anterior a atención", () =>
    expect(
      validarAtencion(
        {
          fecha: "2026-10-01",
          diagnostico: "Control",
          proximoControl: "2026-09-01",
        },
        "2026-10-17",
      ),
    ).toContain("control"));
  it("acepta atención correcta", () =>
    expect(
      validarAtencion(
        { fecha: "2026-10-01", diagnostico: "Control" },
        "2026-10-17",
      ),
    ).toBe(""));
});

describe("Dominios por rol", () => {
  it("acepta admin solo con duocuc.cl", () => {
    expect(correoValidoParaRol("admin@duocuc.cl", "Administrador")).toBe(true);
    expect(correoValidoParaRol("admin@gmail.com", "Administrador")).toBe(false);
  });
  it("acepta dueño solo con profesor.duoc.cl", () => {
    expect(correoValidoParaRol("ana@profesor.duoc.cl", "Dueño")).toBe(true);
    expect(correoValidoParaRol("ana@duocuc.cl", "Dueño")).toBe(false);
  });
  it("acepta recepcionista solo con gmail.com", () => {
    expect(correoValidoParaRol("recepcion@gmail.com", "Recepcionista")).toBe(
      true,
    );
    expect(
      correoValidoParaRol("recepcion@profesor.duoc.cl", "Recepcionista"),
    ).toBe(false);
  });
  it("rechaza registro de dueño con otro dominio", () =>
    expect(
      validarRegistro({
        nombre: "Ana",
        correo: "ana@gmail.com",
        clave: "12345678",
      }),
    ).toContain("@profesor.duoc.cl"));
});
