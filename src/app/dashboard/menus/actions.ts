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
import { getMenuByNumber } from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";

async function getOwnedRestaurant() {
  const user = await requireAuth("restaurant_owner");
  const restaurant = await getRestaurantById(user.restaurant_id!);
  if (!restaurant) throw new Error("Forbidden");
  return restaurant;
}

export async function getMenuWithItemsAction(menuNumber: number) {
  const restaurant = await getOwnedRestaurant();
  const menu = await getMenuByNumber(restaurant.id, menuNumber);
  if (!menu) return null;
  const items = await getMenuItemsByMenu(menu.id);
  return { menu, restaurant, items };
}

export async function addMenuItemAction(formData: FormData) {
  const restaurant = await getOwnedRestaurant();
  const menuId = formData.get("menu_id") as string;
  const menuNumber = Number(formData.get("menu_number"));

  const parsed = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/dashboard/menus/${menuNumber}?error=${encodeURIComponent(error)}`);
  }

  await addMenuItem(menuId, parsed.data);
  revalidatePath(`/dashboard/menus/${menuNumber}`);
  redirect(`/dashboard/menus/${menuNumber}`);
}

export async function updateMenuItemAction(formData: FormData) {
  const restaurant = await getOwnedRestaurant();
  void restaurant; // ownership verified via getOwnedRestaurant
  const menuNumber = Number(formData.get("menu_number"));
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
    redirect(`/dashboard/menus/${menuNumber}?error=${encodeURIComponent(error)}`);
  }

  await updateMenuItem(itemId, parsed.data);
  revalidatePath(`/dashboard/menus/${menuNumber}`);
  redirect(`/dashboard/menus/${menuNumber}`);
}

export async function deleteMenuItemAction(formData: FormData) {
  await getOwnedRestaurant();
  const menuNumber = Number(formData.get("menu_number"));
  const itemId = formData.get("item_id") as string;
  await deleteMenuItem(itemId);
  revalidatePath(`/dashboard/menus/${menuNumber}`);
}

export async function toggleMenuItemAvailabilityAction(formData: FormData) {
  await getOwnedRestaurant();
  const menuNumber = Number(formData.get("menu_number"));
  const itemId = formData.get("item_id") as string;
  await toggleMenuItemAvailability(itemId);
  revalidatePath(`/dashboard/menus/${menuNumber}`);
}
