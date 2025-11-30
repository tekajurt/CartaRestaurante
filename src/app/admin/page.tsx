import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import {
  getMenuItems,
  addMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "./actions";
import ActionButton from "@/components/ui/ActionButton";
import EditMenuItemModal from "./EditMenuItemModal";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const menuItems = await getMenuItems();

  // Group items by category
  const groupedItems = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof menuItems>
  );

  const categories = [
    "Entradas",
    "Platos Principales",
    "Postres",
    "Bebidas",
    "Otros",
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Administración
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <a
                href="/carta"
                className="text-amber-600 hover:text-amber-500 text-sm"
                target="_blank"
              >
                Ver carta →
              </a>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add new item form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Agregar nuevo plato
          </h2>
          <form action={addMenuItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Categoría
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Precio
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={2}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
                />
              </div>
            </div>
            <ActionButton
              type="submit"
              className="w-full md:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              labelLoading="Agregando..."
            >
              Agregar Plato
            </ActionButton>
          </form>
        </div>

        {/* Menu items by category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const items = groupedItems[category] || [];
            if (items.length === 0) return null;

            return (
              <div key={category} className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {category}
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                        <p className="text-sm font-medium text-amber-600 mt-1">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={toggleAvailability}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="available"
                            value={String(item.available)}
                          />
                          <ActionButton
                            type="submit"
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              item.available
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                            labelLoading="Cambiando..."
                          >
                            {item.available ? "Disponible" : "No disponible"}
                          </ActionButton>
                        </form>
                        <EditMenuItemModal item={item} />
                        <form action={deleteMenuItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <ActionButton
                            type="submit"
                            className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                            labelLoading="Eliminando..."
                          >
                            Eliminar
                          </ActionButton>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No hay platos en el menú. Agrega el primero arriba.
          </div>
        )}
      </main>
    </div>
  );
}
