import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/db/restaurant";
import { getMenuByNumber } from "@/lib/db/menu";
import { getMenuItemsByMenuPublic } from "@/lib/db/menuItem";
import { getTheme } from "@/themes";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; menuNumber: string }>;
}) {
  const { restaurantSlug, menuNumber: menuNumberStr } = await params;
  const menuNumber = Number(menuNumberStr);

  const restaurant = getRestaurantBySlug(restaurantSlug);
  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

  const menu = getMenuByNumber(restaurant.id, menuNumber);
  if (!menu || !menu.is_active) {
    notFound();
  }

  const menuItems = getMenuItemsByMenuPublic(menu.id);

  const theme = getTheme(restaurant.theme);
  const MenuPage = theme.MenuPage;

  return <MenuPage restaurant={restaurant} menu={menu} menuItems={menuItems} />;
}
