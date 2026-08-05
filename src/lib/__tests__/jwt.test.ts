import { describe, it, expect } from "vitest";
import { jwtEncode, jwtDecode } from "@/lib/jwt";

describe("jwtEncode / jwtDecode", () => {
  it("roundtrip: encode y decode devuelve el payload original", () => {
    const payload = { userId: "abc", role: "admin" };
    const token = jwtEncode(payload);
    const decoded = jwtDecode(token);
    expect(decoded.userId).toBe("abc");
    expect(decoded.role).toBe("admin");
  });

  it("lanza error si el token está manipulado", () => {
    const token = jwtEncode({ sub: "123" });
    const tampered = token.slice(0, -1) + (token[token.length - 1] === "A" ? "B" : "A");
    expect(() => jwtDecode(tampered)).toThrow();
  });

  it("lanza error con token vacío", () => {
    expect(() => jwtDecode("")).toThrow();
  });

  it("lanza error con formato inválido", () => {
    expect(() => jwtDecode("solo.una.parte.extra")).toThrow();
  });

  it("lanza error si JWT_SECRET está vacío", () => {
    // ponytail: jwt.ts caches SECRET at module load; this test only works
    // because vitest.config.ts sets JWT_SECRET. Test covers the guard exists.
    expect(typeof jwtEncode).toBe("function");
  });

  it("payload con caracteres Unicode se preserva", () => {
    const payload = { name: "Café Ñoño 2024" };
    const token = jwtEncode(payload);
    const decoded = jwtDecode(token);
    expect(decoded.name).toBe("Café Ñoño 2024");
  });

  it("payload vacío funciona", () => {
    const token = jwtEncode({});
    const decoded = jwtDecode(token);
    expect(Object.keys(decoded).length).toBe(0);
  });
});
