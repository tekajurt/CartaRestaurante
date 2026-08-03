import type { Restaurant, Menu, MenuItem } from "@/types";

export default function DefaultMenuPage({
  restaurant,
  menu,
  menuItems,
}: {
  restaurant: Restaurant;
  menu: Menu;
  menuItems: MenuItem[];
}) {
  const grouped = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <h2 className="text-lg text-gray-600 mt-1">{menu.name}</h2>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">Este menú está vacío.</p>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <section key={category} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: restaurant.accent_color, color: restaurant.accent_color }}>
                  {category}
                </h3>
                <div className="space-y-4">
                  {grouped[category].map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-lg font-semibold" style={{ color: restaurant.accent_color }}>
                          ${Number(item.price).toFixed(2)}
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

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <a href={`/${restaurant.slug}`} className="hover:underline">Volver a {restaurant.name}</a>
        </div>
      </footer>
    </div>
  );
}
