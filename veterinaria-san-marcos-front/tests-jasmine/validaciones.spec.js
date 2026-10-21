import { textoRequerido } from "../src/validaciones.js";

describe("Validaciones - Veterinaria San Marcos", () => {
  it("1. Acepta un nombre", () => {
    expect(textoRequerido("Firulais")).toBe(true);
  });

  it("2. Acepta un apellido", () => {
    expect(textoRequerido("González")).toBe(true);
  });

  it("3. Acepta un nombre compuesto", () => {
    expect(textoRequerido("Juan Pérez")).toBe(true);
  });

  it("4. Acepta texto con números", () => {
    expect(textoRequerido("Mascota 2")).toBe(true);
  });

  it("5. Acepta texto con acentos", () => {
    expect(textoRequerido("María")).toBe(true);
  });

  it("6. Rechaza texto vacío", () => {
    expect(textoRequerido("")).toBe(false);
  });

  it("7. Rechaza espacios", () => {
    expect(textoRequerido("   ")).toBe(false);
  });

  it("8. Acepta un nombre con espacios alrededor", () => {
    expect(textoRequerido("  Luna  ")).toBe(true);
  });

  it("9. Acepta una especie", () => {
    expect(textoRequerido("Gato")).toBe(true);
  });

  it("10. Rechaza una cadena de tabulaciones", () => {
    expect(textoRequerido("\t\t")).toBe(false);
  });
});
