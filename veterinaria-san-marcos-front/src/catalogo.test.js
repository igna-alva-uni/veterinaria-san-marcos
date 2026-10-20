import { describe, it, expect } from "vitest";
import { servicios, medicamentos } from "./catalogo";
describe("catálogo oficial", () => {
  it("contiene servicios con códigos únicos", () => {
    expect(servicios.length).toBeGreaterThan(0);
    expect(new Set(servicios.map((x) => x.codigo)).size).toBe(servicios.length);
  });
  it("contiene medicamentos y vacunas", () =>
    expect(medicamentos.length).toBeGreaterThan(0));
});
