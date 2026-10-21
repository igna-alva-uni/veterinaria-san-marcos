import { describe, it, expect } from "vitest";
import { usuariosIniciales } from "./datos";
describe("cuentas demostrativas", () => {
  it("incluye los tres roles requeridos", () => {
    expect(usuariosIniciales.map((u) => u.rol)).toEqual(
      expect.arrayContaining(["Administrador", "Recepcionista", "Dueño"]),
    );
  });
  it("cada cuenta inicial tiene una contraseña definida", () => {
    expect(
      usuariosIniciales.every(
        (u) => typeof u.clave === "string" && u.clave.length >= 8,
      ),
    ).toBe(true);
  });
  it("las cuentas iniciales tienen correos distintos", () => {
    expect(new Set(usuariosIniciales.map((u) => u.correo)).size).toBe(
      usuariosIniciales.length,
    );
  });
});

it("los correos iniciales corresponden al dominio de su rol", async () => {
  const { correoValidoParaRol } = await import("./validaciones");
  expect(
    usuariosIniciales.every((u) => correoValidoParaRol(u.correo, u.rol)),
  ).toBe(true);
});
