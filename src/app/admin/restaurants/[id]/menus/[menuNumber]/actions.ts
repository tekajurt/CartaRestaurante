"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/db/session";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuItemsByMenu,
} from "@/lib/db/menuItem";
import { getMenuById } from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";

const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  category: z.string().min(1, "La categoría es obligatoria").max(100),
  available: z.coerce.boolean().default(true),
});

export async function getMenuWithItemsAction(menuId: string) {
  await requireAuth();
  const menu = getMenuById(menuId);
  if (!menu) return null;
  const restaurant = getRestaurantById(menu.restaurant_id);
  const items = getMenuItemsByMenu(menuId);
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

  addMenuItem(menuId, parsed.data);
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

  updateMenuItem(itemId, parsed.data);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
  redirect(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireAuth();
  const { menuId: _menuId, restaurantId, menuNumber } = getIds(formData);
  void _menuId;
  const itemId = formData.get("item_id") as string;
  deleteMenuItem(itemId);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}

export async function toggleMenuItemAvailabilityAction(formData: FormData) {
  await requireAuth();
  const { menuId: _menuId, restaurantId, menuNumber } = getIds(formData);
  void _menuId;
  const itemId = formData.get("item_id") as string;
  toggleMenuItemAvailability(itemId);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus/${menuNumber}`);
}
