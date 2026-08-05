import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuItemModal from "../MenuItemModal";
import type { MenuItem } from "@/types";

const mockItem: MenuItem = {
  id: "item-1",
  menu_id: "menu-1",
  name: "Pizza Margherita",
  description: "Tomate, mozzarella",
  price: 12.5,
  category: "Pizzas",
  available: true,
  created_at: "2024-01-01",
};

const baseProps = {
  menuId: "menu-1",
  restaurantId: "rest-1",
  menuNumber: 1,
  action: vi.fn(),
};

describe("MenuItemModal", () => {
  it("renderiza botón 'Agregar plato' en modo create", () => {
    render(<MenuItemModal {...baseProps} />);
    expect(screen.getByText("Agregar plato")).toBeInTheDocument();
  });

  it("renderiza botón 'Editar' en modo edit", () => {
    render(<MenuItemModal {...baseProps} item={mockItem} />);
    expect(screen.getByText("Editar")).toBeInTheDocument();
  });

  it("abre modal al hacer click en modo create", async () => {
    render(<MenuItemModal {...baseProps} />);
    await userEvent.click(screen.getByText("Agregar plato"));
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("abre modal con título de edición al hacer click en modo edit", async () => {
    render(<MenuItemModal {...baseProps} item={mockItem} />);
    await userEvent.click(screen.getByText("Editar"));
    expect(screen.getByText("Editar: Pizza Margherita")).toBeInTheDocument();
  });

  it("pre-llena campos en modo edit", async () => {
    render(<MenuItemModal {...baseProps} item={mockItem} />);
    await userEvent.click(screen.getByText("Editar"));

    expect(screen.getByDisplayValue("Pizza Margherita")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pizzas")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12.5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Tomate, mozzarella")).toBeInTheDocument();
  });

  it("tiene hidden inputs con IDs de enrutamiento", async () => {
    render(<MenuItemModal {...baseProps} />);
    await userEvent.click(screen.getByText("Agregar plato"));

    expect(screen.getByDisplayValue("menu-1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("rest-1")).toBeInTheDocument();
  });

  it("incluye hidden input item_id en modo edit", async () => {
    render(<MenuItemModal {...baseProps} item={mockItem} />);
    await userEvent.click(screen.getByText("Editar"));

    expect(screen.getByDisplayValue("item-1")).toBeInTheDocument();
  });

  it("cierra modal con botón Cancelar", async () => {
    render(<MenuItemModal {...baseProps} />);
    await userEvent.click(screen.getByText("Agregar plato"));
    await userEvent.click(screen.getByText("Cancelar"));

    expect(screen.queryByLabelText("Nombre")).toBeNull();
  });

  it("acepta checkbox available como checked", async () => {
    render(<MenuItemModal {...baseProps} item={mockItem} />);
    await userEvent.click(screen.getByText("Editar"));

    const checkbox = screen.getByLabelText("Disponible") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
