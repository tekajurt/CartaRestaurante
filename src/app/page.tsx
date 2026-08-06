import Link from "next/link";
import { getRestaurants } from "@/lib/db/restaurant";
import { getMenusByRestaurant } from "@/lib/db/menu";

export default async function CatalogPage() {
  const allRestaurants = await getRestaurants();
  const activeRestaurants = allRestaurants.filter((r) => r.is_active);

  const menusByRestaurant = await Promise.all(
    activeRestaurants.map((r) =>
      getMenusByRestaurant(r.id).then((menus) => ({
        restaurantId: r.id,
        menus: menus.filter((m) => m.is_active),
      }))
    )
  );

  const menuMap = new Map(
    menusByRestaurant.map(({ restaurantId, menus }) => [restaurantId, menus])
  );

  if (activeRestaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <Link
          href="/login"
          className="fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors z-10"
        >
          Iniciar Sesión
        </Link>
        <div className="bg-white shadow rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Carta Digital</h1>
          <p className="text-gray-500">No hay restaurantes disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Carta Digital</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Link
          href="/login"
          className="fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors z-10"
        >
          Iniciar Sesión
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRestaurants.map((restaurant) => {
            const menus = menuMap.get(restaurant.id) ?? [];
            return (
              <div key={restaurant.id} className="bg-white shadow rounded-lg p-6 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{restaurant.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">/{restaurant.slug}</p>
                  </div>
                  <span
                    className="inline-block w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: restaurant.accent_color }}
                  />
                </div>

                {restaurant.description && (
                  <p className="text-gray-600 mt-3 text-sm line-clamp-2">
                    {restaurant.description}
                  </p>
                )}

                {menus.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Menús
                    </h3>
                    <ul className="space-y-1">
                      {menus.map((menu) => (
                        <li key={menu.id}>
                          <Link
                            href={`/${restaurant.slug}/menu/${menu.menu_number}`}
                            className="text-sm text-amber-600 hover:text-amber-500"
                          >
                            {menu.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <Link
                    href={`/${restaurant.slug}`}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    Ver página
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
