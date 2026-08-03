import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRestaurantWithMenusAction, createMenuAction, deleteMenuAction } from "./actions";
import ActionButton from "@/components/ui/ActionButton";

export default async function RestaurantMenusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const data = await getRestaurantWithMenusAction(id);

  if (!data) redirect("/admin");

  const { restaurant, menus } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Menús de {restaurant.name}</h1>
          <Link href="/admin" className="text-sm text-amber-600 hover:text-amber-500">← Volver</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {sp.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {sp.error}
          </div>
        )}

        <form action={createMenuAction.bind(null, id)} className="bg-white shadow rounded-lg p-6 mb-6 flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nuevo menú
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ej: Menú del día"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            Crear menú
          </button>
        </form>

        {menus.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No hay menús. Crea el primero.
          </div>
        ) : (
          <div className="space-y-4">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Menú #{menu.menu_number}: {menu.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <a href={`/${restaurant.slug}/menu/${menu.menu_number}`} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-500">
                      /{restaurant.slug}/menu/{menu.menu_number}
                    </a>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/restaurants/${restaurant.id}/menus/${menu.menu_number}`}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Editar platos
                  </a>
                  <form action={deleteMenuAction.bind(null, menu.id, restaurant.id)}>
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
        )}
      </main>
    </div>
  );
}
