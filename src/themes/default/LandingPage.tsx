import type { Restaurant } from "@/types";

export default function DefaultLandingPage({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="text-gray-600 mb-8">{restaurant.description}</p>
        )}
        <a
          href={`/${restaurant.slug}/menu/1`}
          className="inline-block px-6 py-3 text-white font-medium rounded-md transition-colors"
          style={{ backgroundColor: restaurant.accent_color }}
        >
          Ver menú
        </a>
      </div>
    </div>
  );
}
