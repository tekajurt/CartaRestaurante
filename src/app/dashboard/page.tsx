import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signout } from "@/app/login/actions";
import { getOwnerRestaurantAction, createMenuAction, deleteMenuAction } from "./actions";
import ActionButton from "@/components/ui/ActionButton";
import QRCode from "@/components/ui/QRCode";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "restaurant_owner") redirect("/admin");

  const sp = await searchParams;
  const data = await getOwnerRestaurantAction();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {data?.restaurant.name ?? "Mi Restaurante"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.username}</span>
            <form action={signout}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-500"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {sp.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {sp.error}
          </div>
        )}

        {!data ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No se encontró tu restaurante. Contacta al administrador.
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {data.restaurant.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    /{data.restaurant.slug}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {data.restaurant.description || "Sin descripción"}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <QRCode
                    url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/${data.restaurant.slug}`}
                    size={120}
                    className="rounded-lg border"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    QR de tu menú
                  </p>
                </div>
              </div>
            </div>

            <form
              action={createMenuAction}
              className="bg-white shadow rounded-lg p-6 mb-6 flex items-end gap-4"
            >
              <input
                type="hidden"
                name="restaurant_id"
                value={data.restaurant.id}
              />
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
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

            {data.menus.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                No hay menús. Crea el primero.
              </div>
            ) : (
              <div className="space-y-4">
                {data.menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Menú #{menu.menu_number}: {menu.name}
                      </h3>
                      <a
                        href={`/${data.restaurant.slug}/menu/${menu.menu_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-600 hover:text-amber-500"
                      >
                        /{data.restaurant.slug}/menu/{menu.menu_number}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <QRCode
                        url={`${process.env.NEXT_PUBLIC_BASE_URL || ""}/${data.restaurant.slug}/menu/${menu.menu_number}`}
                        size={80}
                        className="rounded border"
                      />
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/menus/${menu.menu_number}`}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          Editar platos
                        </Link>
                        <form
                          action={deleteMenuAction.bind(
                            null,
                            menu.id,
                            data.restaurant.id
                          )}
                        >
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
