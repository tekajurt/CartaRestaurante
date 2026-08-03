import { getSessionUser } from "@/lib/db/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createRestaurantAction } from "../actions";
import { themeList } from "@/themes";

export default async function NewRestaurantPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Nuevo restaurante</h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/admin" className="text-sm text-amber-600 hover:text-amber-500 mb-4 inline-block">
          ← Volver al panel
        </Link>

        {params.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {params.error}
          </div>
        )}

        <form action={createRestaurantAction} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
            />
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Plantilla
            </label>
            <select
              id="theme"
              name="theme"
              defaultValue="default"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2"
            >
              {themeList.map((theme) => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.name} — {theme.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="accent_color" className="block text-sm font-medium text-gray-700">
              Color de acento
            </label>
            <input
              id="accent_color"
              name="accent_color"
              type="color"
              defaultValue="#f59e0b"
              className="mt-1 block h-10 w-20 rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              defaultChecked
              value="true"
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Activo
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              Crear restaurante
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
