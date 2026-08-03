import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import { getMenuByNumber } from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";
import { getMenuItemsByMenu } from "@/lib/db/menuItem";
import {
  addMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
} from "./actions";
import MenuItemModal from "./MenuItemModal";
import ActionButton from "@/components/ui/ActionButton";

export default async function MenuItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; menuNumber: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id: restaurantId, menuNumber: menuNumberStr } = await params;
  const menuNumber = Number(menuNumberStr);
  const sp = await searchParams;

  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) redirect("/admin");

  const menu = getMenuByNumber(restaurantId, menuNumber);
  if (!menu) redirect(`/admin/restaurants/${restaurantId}/menus`);

  const items = getMenuItemsByMenu(menu.id);

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {restaurant.name} — Menú #{menuNumber}: {menu.name}
          </h1>
          <a href={`/admin/restaurants/${restaurantId}/menus`} className="text-sm text-amber-600 hover:text-amber-500">
            ← Volver a menús
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {sp.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {sp.error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Platos</h2>
          <MenuItemModal
            menuId={menu.id}
            restaurantId={restaurantId}
            menuNumber={menuNumber}
            action={addMenuItemAction}
          />
        </div>

        {items.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No hay platos. Agrega el primero.
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-4">
                  {grouped[category].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-sm font-medium text-amber-600 mt-1">${Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <form action={toggleMenuItemAvailabilityAction}>
                          <input type="hidden" name="menu_id" value={menu.id} />
                          <input type="hidden" name="restaurant_id" value={restaurantId} />
                          <input type="hidden" name="menu_number" value={menuNumber} />
                          <input type="hidden" name="item_id" value={item.id} />
                          <ActionButton
                            type="submit"
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              item.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                            labelLoading="Cambiando..."
                          >
                            {item.available ? "Disponible" : "No disponible"}
                          </ActionButton>
                        </form>

                        <MenuItemModal
                          item={item}
                          menuId={menu.id}
                          restaurantId={restaurantId}
                          menuNumber={menuNumber}
                          action={updateMenuItemAction}
                        />

                        <form action={deleteMenuItemAction}>
                          <input type="hidden" name="menu_id" value={menu.id} />
                          <input type="hidden" name="restaurant_id" value={restaurantId} />
                          <input type="hidden" name="menu_number" value={menuNumber} />
                          <input type="hidden" name="item_id" value={item.id} />
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
