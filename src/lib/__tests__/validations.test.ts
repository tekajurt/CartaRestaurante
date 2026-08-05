import { describe, it, expect } from "vitest";
import { restaurantSchema, menuSchema, menuItemSchema } from "@/lib/validations";

describe("restaurantSchema", () => {
  it("acepta datos válidos completos", () => {
    const result = restaurantSchema.safeParse({
      name: "La Trattoria",
      description: "Comida italiana",
      theme: "default",
      accent_color: "#f59e0b",
      is_active: "true",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = restaurantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre menor a 2 caracteres", () => {
    const result = restaurantSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre mayor a 100 caracteres", () => {
    const result = restaurantSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("acepta solo nombre (el resto tiene defaults)", () => {
    const result = restaurantSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.theme).toBe("default");
      expect(result.data.accent_color).toBe("#f59e0b");
      expect(result.data.is_active).toBe(true);
    }
  });

  it("rechaza color inválido", () => {
    const result = restaurantSchema.safeParse({
      name: "Test",
      accent_color: "rojo",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza tema inválido", () => {
    const result = restaurantSchema.safeParse({
      name: "Test",
      theme: "futuristico",
    });
    expect(result.success).toBe(false);
  });

  it("coerciona is_active de string 'true' a true", () => {
    const result = restaurantSchema.safeParse({
      name: "Test",
      is_active: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_active).toBe(true);
  });

  it("is_active es true por defecto si no se envía", () => {
    const result = restaurantSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_active).toBe(true);
  });
});

describe("menuSchema", () => {
  it("acepta nombre válido", () => {
    const result = menuSchema.safeParse({ name: "Menú Ejecutivo" });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = menuSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre mayor a 100 caracteres", () => {
    const result = menuSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("menuItemSchema", () => {
  const validItem = {
    name: "Pizza Margherita",
    description: "Tomate, mozzarella, albahaca",
    price: "12.50",
    category: "Pizzas",
    available: "true",
  };

  it("acepta datos válidos completos", () => {
    const result = menuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("coerciona price de string a number", () => {
    const result = menuItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.price).toBe(12.5);
  });

  it("rechaza precio negativo", () => {
    const result = menuItemSchema.safeParse({ ...validItem, price: "-5" });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const result = menuItemSchema.safeParse({ ...validItem, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza categoría vacía", () => {
    const result = menuItemSchema.safeParse({ ...validItem, category: "" });
    expect(result.success).toBe(false);
  });

  it("description tiene default vacío", () => {
    const result = menuItemSchema.safeParse({
      name: "Test",
      price: "5",
      category: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBe("");
  });

  it("partial() permite campos parciales", () => {
    const partial = menuItemSchema.partial();
    const result = partial.safeParse({ name: "Nuevo nombre" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Nuevo nombre");
  });
});
