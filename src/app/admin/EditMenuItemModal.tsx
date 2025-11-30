"use client";

import { useState } from "react";
import type { MenuItem } from "@/types/menu";
import Modal from "@/components/ui/Modal";
import { updateMenuItem } from "./actions";
import ActionButton from "@/components/ui/ActionButton";

type Props = {
  item: MenuItem;
};

export default function EditMenuItemModal({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
        onClick={() => setOpen(true)}
      >
        Editar
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Editar: ${item.name}`}>
        <form
          action={async (formData: FormData) => {
            await updateMenuItem(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="available" value={String(item.available)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                defaultValue={item.name}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <input
                id="category"
                name="category"
                defaultValue={item.category}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(item.price)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={item.description}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <ActionButton
              type="submit"
              className="px-4 py-2 text-sm rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              labelLoading="Guardando..."
            >
              Guardar cambios
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
