import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModernLandingPage from "../LandingPage";
import type { Restaurant } from "@/types";

const restaurant: Restaurant = {
  id: "rest-1",
  slug: "burger-house",
  name: "Burger House",
  description: "Las mejores burgers",
  theme: "modern",
  accent_color: "#10b981",
  is_active: true,
  created_at: "2024-01-01",
};

describe("ModernLandingPage", () => {
  it("renderiza nombre del restaurante", () => {
    render(<ModernLandingPage restaurant={restaurant} />);
    expect(screen.getByText("Burger House")).toBeInTheDocument();
  });

  it("renderiza descripción", () => {
    render(<ModernLandingPage restaurant={restaurant} />);
    expect(screen.getByText("Las mejores burgers")).toBeInTheDocument();
  });

  it("link al menú 1 con texto 'Ver menú'", () => {
    render(<ModernLandingPage restaurant={restaurant} />);
    const link = screen.getByText("Ver nuestro menú");
    expect(link).toHaveAttribute("href", "/burger-house/menu/1");
  });

  it("aplica color de acento inline al botón", () => {
    render(<ModernLandingPage restaurant={restaurant} />);
    const link = screen.getByText("Ver nuestro menú");
    expect(link.style.backgroundColor).toBe("rgb(16, 185, 129)");
  });
});
