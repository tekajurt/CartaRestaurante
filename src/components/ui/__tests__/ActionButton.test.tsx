import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ActionButton from "@/components/ui/ActionButton";

describe("ActionButton", () => {
  it("renderiza children normalmente", () => {
    render(
      <form>
        <ActionButton>Guardar</ActionButton>
      </form>
    );
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("pasa className al botón", () => {
    render(
      <form>
        <ActionButton className="bg-red-500">Guardar</ActionButton>
      </form>
    );
    expect(screen.getByRole("button")).toHaveClass("bg-red-500");
  });

  it("usa el labelLoading por defecto", () => {
    render(
      <form>
        <ActionButton>Guardar</ActionButton>
      </form>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("aplica labelLoading personalizado como fallback visible", () => {
    render(
      <form>
        <ActionButton labelLoading="Procesando...">Guardar</ActionButton>
      </form>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("respeta disabled prop", () => {
    render(
      <form>
        <ActionButton disabled>Guardar</ActionButton>
      </form>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("es de tipo submit por defecto", () => {
    render(
      <form>
        <ActionButton type="submit">Guardar</ActionButton>
      </form>
    );
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
