import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/db/restaurant";

describe("slugify", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("La Trattoria")).toBe("la-trattoria");
  });

  it("elimina acentos y diacríticos", () => {
    expect(slugify("Café Ñoño")).toBe("cafe-nono");
  });

  it("reemplaza caracteres especiales por guiones", () => {
    expect(slugify("Pizza & Pasta")).toBe("pizza-pasta");
  });

  it("elimina guiones al inicio y final", () => {
    expect(slugify("--Hola--")).toBe("hola");
  });

  it("retorna string vacío para input sin caracteres válidos", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("maneja múltiples espacios consecutivos", () => {
    expect(slugify("El   Mejor   Sushi")).toBe("el-mejor-sushi");
  });

  it("maneja string vacío", () => {
    expect(slugify("")).toBe("");
  });

  it("preserva números", () => {
    expect(slugify("Sushi Bar 2024")).toBe("sushi-bar-2024");
  });
});
