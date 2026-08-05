import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signout } from "@/app/login/actions";
import { getRestaurantsAction, deleteRestaurantAction } from "./restaurants/actions";
import ActionButton from "@/components/ui/ActionButton";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const restaurants = await getRestaurantsAction();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
              <Link
                href="/admin/accounts"
                className="text-sm text-amber-600 hover:text-amber-500"
              >
                Cuentas
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email ?? user.username}</span>
              <form action={signout}>
                <button type="submit" className="text-sm text-red-600 hover:text-red-500">
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Restaurantes</h2>
          <Link
            href="/admin/restaurants/new"
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700"
          >
            Nuevo restaurante
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No hay restaurantes. Crea el primero.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">/{restaurant.slug}</p>
                  </div>
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: restaurant.accent_color }}
                  />
                </div>
                <p className="text-gray-600 mt-3 text-sm line-clamp-2">{restaurant.description || "Sin descripción"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/edit`}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/admin/restaurants/${restaurant.id}/menus`}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Menús
                  </Link>
                  <a
                    href={`/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Ver página
                  </a>
                  <form action={deleteRestaurantAction.bind(null, restaurant.id)}>
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
