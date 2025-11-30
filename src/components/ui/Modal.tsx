"use client";

import { PropsWithChildren, useEffect } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
}>;

export default function Modal({ open, onClose, title, size = "md", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${maxW} mx-4 rounded-lg bg-white shadow-lg`}
           role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
