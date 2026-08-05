import { describe, it, expect } from "vitest";
import { themes, getTheme, themeList } from "@/themes";

describe("getTheme", () => {
  it("retorna el tema default cuando existe", () => {
    const theme = getTheme("default");
    expect(theme.slug).toBe("default");
    expect(theme.LandingPage).toBeDefined();
    expect(theme.MenuPage).toBeDefined();
  });

  it("retorna el tema modern cuando existe", () => {
    const theme = getTheme("modern");
    expect(theme.slug).toBe("modern");
    expect(theme.name).toBe("Moderno");
  });

  it("hace fallback a default cuando el slug no existe", () => {
    const theme = getTheme("inexistente");
    expect(theme.slug).toBe("default");
  });

  it("cada tema tiene los campos obligatorios", () => {
    for (const [slug, theme] of Object.entries(themes)) {
      expect(theme.slug).toBe(slug);
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.LandingPage).toBeDefined();
      expect(theme.MenuPage).toBeDefined();
    }
  });
});

describe("themeList", () => {
  it("contiene todos los temas registrados", () => {
    expect(themeList.length).toBe(Object.keys(themes).length);
  });

  it("no expone referencias a componentes", () => {
    for (const entry of themeList) {
      expect(entry).toHaveProperty("slug");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("description");
      expect(entry).toHaveProperty("defaultColor");
      expect(entry).not.toHaveProperty("LandingPage");
      expect(entry).not.toHaveProperty("MenuPage");
    }
  });
});
