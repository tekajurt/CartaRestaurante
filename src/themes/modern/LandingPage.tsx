import type { Restaurant } from "@/types";

export default function ModernLandingPage({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-5xl font-bold mb-6">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-zinc-300 text-lg mb-10">{restaurant.description}</p>
        )}
        <a
          href={`/${restaurant.slug}/menu/1`}
          className="inline-block px-8 py-4 text-lg font-semibold rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: restaurant.accent_color, color: "#ffffff" }}
        >
          Ver nuestro menú
        </a>
      </div>
    </div>
  );
}
