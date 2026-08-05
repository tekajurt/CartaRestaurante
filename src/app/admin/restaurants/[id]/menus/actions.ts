"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/db/session";
import { menuSchema } from "@/lib/validations";
import {
  createMenu,
  updateMenu,
  deleteMenu,
  getMenusByRestaurant,
  getMenuById,
} from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";

export async function getRestaurantWithMenusAction(id: string) {
  await requireAuth();
  const restaurant = await getRestaurantById(id);
  if (!restaurant) return null;
  const menus = await getMenusByRestaurant(id);
  return { restaurant, menus };
}

export async function createMenuAction(restaurantId: string, formData: FormData) {
  await requireAuth();

  const parsed = menuSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/${restaurantId}/menus?error=${encodeURIComponent(error)}`);
  }

  await createMenu(restaurantId, parsed.data.name);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus`);
  redirect(`/admin/restaurants/${restaurantId}/menus`);
}

export async function updateMenuAction(id: string, restaurantId: string, formData: FormData) {
  await requireAuth();

  const parsed = menuSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/${restaurantId}/menus?error=${encodeURIComponent(error)}`);
  }

  await updateMenu(id, parsed.data.name);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus`);
  redirect(`/admin/restaurants/${restaurantId}/menus`);
}

export async function deleteMenuAction(id: string, restaurantId: string) {
  await requireAuth();
  await deleteMenu(id);
  revalidatePath(`/admin/restaurants/${restaurantId}/menus`);
}

export async function getMenuAction(id: string) {
  await requireAuth();
  return await getMenuById(id);
}
