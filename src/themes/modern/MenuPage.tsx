import type { Restaurant, Menu, MenuItem } from "@/types";

export default function ModernMenuPage({
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
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="py-12 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
        <h2 className="text-xl text-zinc-400">{menu.name}</h2>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        {categories.length === 0 ? (
          <p className="text-center text-zinc-500">Este menú está vacío.</p>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category}>
                <h3 className="text-2xl font-bold mb-6 uppercase tracking-wider" style={{ color: restaurant.accent_color }}>
                  {category}
                </h3>
                <div className="space-y-6">
                  {grouped[category].map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b border-zinc-700 pb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold">{item.name}</h4>
                        <p className="text-zinc-400 mt-1">{item.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-xl font-bold" style={{ color: restaurant.accent_color }}>
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

      <footer className="py-8 text-center border-t border-zinc-700">
        <a href={`/${restaurant.slug}`} className="text-zinc-400 hover:text-white transition-colors">Volver a {restaurant.name}</a>
      </footer>
    </div>
  );
}
