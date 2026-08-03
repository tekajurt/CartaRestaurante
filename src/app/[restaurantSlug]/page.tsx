import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/db/restaurant";
import { getTheme } from "@/themes";

export default async function RestaurantLandingPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const restaurant = getRestaurantBySlug(restaurantSlug);

  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

  const theme = getTheme(restaurant.theme);
  const LandingPage = theme.LandingPage;

  return <LandingPage restaurant={restaurant} />;
}
