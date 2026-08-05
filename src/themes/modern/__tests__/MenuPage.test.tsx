import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModernMenuPage from "../MenuPage";
import type { Restaurant, Menu, MenuItem } from "@/types";

const restaurant: Restaurant = {
  id: "rest-1",
  slug: "burger-house",
  name: "Burger House",
  description: "",
  theme: "modern",
  accent_color: "#10b981",
  is_active: true,
  created_at: "2024-01-01",
};

const menu: Menu = {
  id: "menu-1",
  restaurant_id: "rest-1",
  name: "Menú Principal",
  menu_number: 1,
  created_at: "2024-01-01",
};

const items: MenuItem[] = [
  {
    id: "i1",
    menu_id: "menu-1",
    name: "Classic Burger",
    description: "200g beef, cheddar",
    price: 9.99,
    category: "Burgers",
    available: true,
    created_at: "2024-01-01",
  },
];

describe("ModernMenuPage", () => {
  it("renderiza nombre de restaurante y menú", () => {
    render(<ModernMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("Burger House")).toBeInTheDocument();
    expect(screen.getByText("Menú Principal")).toBeInTheDocument();
  });

  it("renderiza platos", () => {
    render(<ModernMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    expect(screen.getByText("Classic Burger")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
  });

  it("muestra mensaje vacío sin items", () => {
    render(<ModernMenuPage restaurant={restaurant} menu={menu} menuItems={[]} />);
    expect(screen.getByText("Este menú está vacío.")).toBeInTheDocument();
  });

  it("aplica color de acento", () => {
    render(<ModernMenuPage restaurant={restaurant} menu={menu} menuItems={items} />);
    const categoryTitle = screen.getByText("Burgers");
    expect(categoryTitle.style.color).toBe("rgb(16, 185, 129)");
  });
});
