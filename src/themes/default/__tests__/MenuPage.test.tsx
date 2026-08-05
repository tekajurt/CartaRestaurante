import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DefaultMenuPage from "../MenuPage";
import type { Restaurant, Menu, MenuItem } from "@/types";

const restaurant: Restaurant = {
  id: "rest-1",
  slug: "la-trattoria",
  name: "La Trattoria",
  description: "",
  theme: "default",
  accent_color: "#f59e0b",
  is_active: true,
  created_at: "2024-01-01",
};

const menu: Menu = {
  id: "menu-1",
  restaurant_id: "rest-1",
  name: "Menú Ejecutivo",
  menu_number: 1,
  is_active: true,
  created_at: "2024-01-01",
};

const items: MenuItem[] = [
  {
    id: "i1",
    menu_id: "menu-1",
    name: "Pizza Margherita",
    description: "Clásica italiana",
    price: 12.5,
    category: "Pizzas",
    available: true,
    created_at: "2024-01-01",
  },
  {
    id: "i2",
    menu_id: "menu-1",
    name: "Risotto",
    description: "",
    price: 15,
    category: "Principales",
    available: true,
    created_at: "2024-01-01",
  },
  {
    id: "i3",
    menu_id: "menu-1",
    name: "Pizza Napolitana",
    description: "Anchoas y alcaparras",
    price: 14,
    category: "Pizzas",
    available: true,
    created_at: "2024-01-01",
  },
];

describe("DefaultMenuPage", () => {
  it("renderiza nombre de restaurante y menú", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("La Trattoria")).toBeInTheDocument();
    expect(screen.getByText("Menú Ejecutivo")).toBeInTheDocument();
  });

  it("agrupa items por categoría", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("Pizzas")).toBeInTheDocument();
    expect(screen.getByText("Principales")).toBeInTheDocument();
  });

  it("renderiza todos los platos", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
    expect(screen.getByText("Risotto")).toBeInTheDocument();
    expect(screen.getByText("Pizza Napolitana")).toBeInTheDocument();
  });

  it("muestra mensaje de menú vacío", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={[]} />);
    expect(screen.getByText("Este menú está vacío.")).toBeInTheDocument();
  });

  it("formatea precios con dos decimales", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("$15.00")).toBeInTheDocument();
  });

  it("muestra descripciones de platos", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("Clásica italiana")).toBeInTheDocument();
    expect(screen.getByText("Anchoas y alcaparras")).toBeInTheDocument();
  });

  it("aplica color de acento a títulos de categoría", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    const categoryTitle = screen.getByText("Pizzas");
    expect(categoryTitle.style.color).toBe("rgb(245, 158, 11)");
  });

  it("footer linkea de vuelta al restaurante", () => {
    render(<DefaultMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    const link = screen.getByText("Volver a La Trattoria");
    expect(link).toHaveAttribute("href", "/la-trattoria");
  });
});
