import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DefaultLandingPage from "../LandingPage";
import type { Restaurant } from "@/types";

const restaurant: Restaurant = {
  id: "rest-1",
  slug: "la-trattoria",
  name: "La Trattoria",
  description: "Auténtica cocina italiana",
  theme: "default",
  accent_color: "#e53e3e",
  is_active: true,
  created_at: "2024-01-01",
};

describe("DefaultLandingPage", () => {
  it("renderiza nombre del restaurante", () => {
    render(<DefaultLandingPage restaurant={restaurant} />);
    expect(screen.getByText("La Trattoria")).toBeInTheDocument();
  });

  it("renderiza descripción cuando existe", () => {
    render(<DefaultLandingPage restaurant={restaurant} />);
    expect(screen.getByText("Auténtica cocina italiana")).toBeInTheDocument();
  });

  it("no renderiza descripción cuando está vacía", () => {
    const r = { ...restaurant, description: "" };
    render(<DefaultLandingPage restaurant={r} />);
    expect(screen.queryByText("Auténtica cocina italiana")).toBeNull();
  });

  it("el botón 'Ver menú' linkea al menú 1", () => {
    render(<DefaultLandingPage restaurant={restaurant} />);
    const link = screen.getByText("Ver menú");
    expect(link).toHaveAttribute("href", "/la-trattoria/menu/1");
  });

  it("aplica color de acento del restaurante al botón", () => {
    render(<DefaultLandingPage restaurant={restaurant} />);
    const link = screen.getByText("Ver menú");
    expect(link.style.backgroundColor).toBe("rgb(229, 62, 62)");
  });
});
