import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("no renderiza cuando open=false", () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>contenido</p>
      </Modal>
    );
    expect(screen.queryByText("contenido")).toBeNull();
  });

  it("renderiza cuando open=true", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>contenido</p>
      </Modal>
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("muestra el título correctamente", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Mi Título">
        <span />
      </Modal>
    );
    expect(screen.getByText("Mi Título")).toBeInTheDocument();
  });

  it("cierra con botón ✕", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <span />
      </Modal>
    );
    await userEvent.click(screen.getByLabelText("Cerrar"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("cierra con backdrop click", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <span />
      </Modal>
    );
    await userEvent.click(document.querySelector(".bg-black\\/40")!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("cierra con tecla Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <span />
      </Modal>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("no llama onClose con Escape cuando está cerrado", () => {
    const onClose = vi.fn();
    render(
      <Modal open={false} onClose={onClose}>
        <span />
      </Modal>
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("aplica clase max-w-md para size=sm", () => {
    render(
      <Modal open={true} onClose={vi.fn()} size="sm">
        <span />
      </Modal>
    );
    expect(document.querySelector(".max-w-md")).toBeTruthy();
  });

  it("aplica clase max-w-xl para size=md (default)", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <span />
      </Modal>
    );
    expect(document.querySelector(".max-w-xl")).toBeTruthy();
  });

  it("aplica clase max-w-3xl para size=lg", () => {
    render(
      <Modal open={true} onClose={vi.fn()} size="lg">
        <span />
      </Modal>
    );
    expect(document.querySelector(".max-w-3xl")).toBeTruthy();
  });

  it("tiene atributos de accesibilidad", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <span />
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });
});
