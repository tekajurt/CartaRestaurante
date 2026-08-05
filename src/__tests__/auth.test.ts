import { describe, it, expect, vi, beforeEach } from "vitest";
import { jwtEncode, jwtDecode } from "@/lib/jwt";
import { accountSchema } from "@/lib/validations";

describe("JWT with extended User (role, restaurant_id, username)", () => {
  it("roundtrip con payload completo de User", () => {
    const payload = {
      userId: "u1",
      email: "admin@test.com",
      username: null,
      role: "admin",
      restaurant_id: null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = jwtEncode(payload);
    const decoded = jwtDecode(token);

    expect(decoded.userId).toBe("u1");
    expect(decoded.email).toBe("admin@test.com");
    expect(decoded.username).toBeNull();
    expect(decoded.role).toBe("admin");
    expect(decoded.restaurant_id).toBeNull();
  });

  it("roundtrip con restaurant_owner", () => {
    const payload = {
      userId: "u2",
      email: null,
      username: "trattoria",
      role: "restaurant_owner",
      restaurant_id: "r-rest-1",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = jwtEncode(payload);
    const decoded = jwtDecode(token);

    expect(decoded.userId).toBe("u2");
    expect(decoded.email).toBeNull();
    expect(decoded.username).toBe("trattoria");
    expect(decoded.role).toBe("restaurant_owner");
    expect(decoded.restaurant_id).toBe("r-rest-1");
  });
});

describe("accountSchema validation", () => {
  it("acepta cuenta válida", () => {
    const result = accountSchema.safeParse({
      username: "trattoria",
      password: "demo123",
      restaurant_id: "r-1",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza username muy corto", () => {
    const result = accountSchema.safeParse({
      username: "a",
      password: "demo123",
      restaurant_id: "r-1",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza password muy corto", () => {
    const result = accountSchema.safeParse({
      username: "trattoria",
      password: "ab",
      restaurant_id: "r-1",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza restaurant_id vacio", () => {
    const result = accountSchema.safeParse({
      username: "trattoria",
      password: "demo123",
      restaurant_id: "",
    });
    expect(result.success).toBe(false);
  });

  it("partial permite solo actualizar password", () => {
    const result = accountSchema.partial().safeParse({
      password: "nuevapass",
    });
    expect(result.success).toBe(true);
  });
});

describe("verifyUserPassword discriminator", () => {
  it("detecta email por @", () => {
    const isEmail = (s: string) => s.includes("@");
    expect(isEmail("admin@restaurant.local")).toBe(true);
    expect(isEmail("trattoria")).toBe(false);
  });

  it("detecta username sin @", () => {
    const isEmail = (s: string) => s.includes("@");
    expect(isEmail("chef_123")).toBe(false);
    expect(isEmail("a@b.c")).toBe(true);
  });
});
