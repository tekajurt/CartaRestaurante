import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/app/admin/actions";

export default async function CartaPage() {
  const supabase = await createClient();

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("available", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  // Group items by category
  const groupedItems = (menuItems || []).reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const categories = Object.keys(groupedItems).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            Nuestra Carta
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Descubre nuestros deliciosos platos
          </p>
        </div>
      </header>

      {/* Menu */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">
              El menú se está actualizando. Vuelve pronto.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <section key={category} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-amber-600 mb-4 border-b-2 border-amber-200 pb-2">
                  {category}
                </h2>
                <div className="space-y-4">
                  {groupedItems[category].map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-lg font-semibold text-amber-600">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>¡Gracias por visitarnos!</p>
        </div>
      </footer>
    </div>
  );
}
