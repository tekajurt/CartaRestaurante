import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountsAction, createAccountAction, deleteAccountAction } from "./actions";
import { getRestaurants } from "@/lib/db/restaurant";
import ActionButton from "@/components/ui/ActionButton";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/admin");

  const sp = await searchParams;
  const accounts = await getAccountsAction();
  const restaurants = await getRestaurants();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Cuentas de Restaurante</h1>
          <Link href="/admin" className="text-sm text-amber-600 hover:text-amber-500">
            ← Volver
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {sp.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {sp.error}
          </div>
        )}

        <form
          action={createAccountAction}
          className="bg-white shadow rounded-lg p-6 mb-6 space-y-4"
        >
          <h2 className="text-sm font-medium text-gray-700">Nueva cuenta</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-600">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-600">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label htmlFor="restaurant_id" className="block text-xs font-medium text-gray-600">
                Restaurante
              </label>
              <select
                id="restaurant_id"
                name="restaurant_id"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
              >
                <option value="">Seleccionar...</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
          >
            Crear cuenta
          </button>
        </form>

        {accounts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No hay cuentas de restaurante.
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const restaurant = restaurants.find((r) => r.id === account.restaurant_id);
              return (
                <div
                  key={account.id}
                  className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{account.username}</p>
                    <p className="text-sm text-gray-500">
                      {restaurant ? restaurant.name : "Sin restaurante asignado"}
                    </p>
                  </div>
                  <form action={deleteAccountAction.bind(null, account.id)}>
                    <ActionButton
                      type="submit"
                      className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200"
                      labelLoading="Eliminando..."
                    >
                      Eliminar
                    </ActionButton>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
