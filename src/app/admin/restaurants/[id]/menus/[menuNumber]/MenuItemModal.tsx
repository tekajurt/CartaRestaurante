"use client";

import { useState } from "react";
import type { MenuItem } from "@/types";
import Modal from "@/components/ui/Modal";
import ActionButton from "@/components/ui/ActionButton";

export default function MenuItemModal({
  item,
  menuId,
  restaurantId,
  menuNumber,
  action,
}: {
  item?: MenuItem;
  menuId: string;
  restaurantId: string;
  menuNumber: number;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const isEditing = !!item;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`px-3 py-1 text-xs font-medium rounded-md ${
          isEditing ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-amber-600 text-white hover:bg-amber-700"
        }`}
      >
        {isEditing ? "Editar" : "Agregar plato"}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={isEditing ? `Editar: ${item.name}` : "Agregar plato"}>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="menu_id" value={menuId} />
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="menu_number" value={menuNumber} />
          {item && <input type="hidden" name="item_id" value={item.id} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={item?.name}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
              <input
                id="category"
                name="category"
                type="text"
                defaultValue={item?.category}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.price}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div className="flex items-center md:pt-6">
              <input
                id="available"
                name="available"
                type="checkbox"
                defaultChecked={item?.available ?? true}
                value="true"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-900">Disponible</label>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={item?.description}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">
              Cancelar
            </button>
            <ActionButton
              type="submit"
              className="px-4 py-2 text-sm rounded-md text-white bg-amber-600 hover:bg-amber-700"
              labelLoading="Guardando..."
            >
              {isEditing ? "Guardar cambios" : "Agregar plato"}
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
