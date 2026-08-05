"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/db/session";
import { menuItemSchema } from "@/lib/validations";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuItemsByMenu,
} from "@/lib/db/menuItem";
import { getMenuById } from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";

export async function getMenuWithItemsAction(menuId: string) {
  await requireAuth();
  const menu = await getMenuById(menuId);
  if (!menu) return null;
  const restaurant = await getRestaurantById(menu.restaurant_id);
  const items = await getMenuItemsByMenu(menuId);
  return { menu, restaurant, items };
}

function getIds(formData: FormData) {
  const menuId = formData.get("menu_id") as string;
  const restaurantId = formData.get("restaurant_id") as string;
  const menuNumber = Number(formData.get("menu_number"));
  return { menuId, restaurantId, menuNumber };
}

export async function addMenuItemAction(formData: FormData) {
  await requireAuth();
  const { menuId, restaurantId, menuNumber } = getIds(formData);

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/${restaurantId}/menus/${menuNumber}?error=${encodeURIComponent(error)}`);
  }

  await addMenuItem(menuId, parsed.data);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
  redirect(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}

export async function updateMenuItemAction(formData: FormData) {
  await requireAuth();
  const { menuId: _menuId, restaurantId, menuNumber } = getIds(formData);
  void _menuId;
  const itemId = formData.get("item_id") as string;

  const parsed = menuItemSchema.partial().safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/${restaurantId}/menus/${menuNumber}?error=${encodeURIComponent(error)}`);
  }

  await updateMenuItem(itemId, parsed.data);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
  redirect(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAuth();
  const { menuId: _menuId, restaurantId, menuNumber } = getIds(formData);
  void _menuId;
  const itemId = formData.get("item_id") as string;
  await deleteMenuItem(itemId);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}

export async function toggleMenuItemAvailabilityAction(formData: FormData) {
  await requireAuth();
  const { menuId: _menuId, restaurantId, menuNumber } = getIds(formData);
  void _menuId;
  const itemId = formData.get("item_id") as string;
  await toggleMenuItemAvailability(itemId);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}
