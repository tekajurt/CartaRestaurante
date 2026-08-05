"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/db/session";
import { menuSchema } from "@/lib/validations";
import { createMenu, deleteMenu, getMenusByRestaurant } from "@/lib/db/menu";
import { getRestaurantById } from "@/lib/db/restaurant";

function ensureOwnership(restaurantId: string): Promise<{ userId: string; restaurant_id: string }> {
  // ponytail: requireAuth verifies the session; we additionally verify the user owns this restaurant
  return requireAuth("restaurant_owner").then((user) => {
    if (user.restaurant_id !== restaurantId) throw new Error("Forbidden");
    return { userId: user.id, restaurant_id: user.restaurant_id };
  });
}

export async function getOwnerRestaurantAction() {
  const user = await requireAuth("restaurant_owner");
  const restaurant = await getRestaurantById(user.restaurant_id!);
  if (!restaurant) return null;
  const menus = await getMenusByRestaurant(restaurant.id);
  return { restaurant, menus };
}

export async function createMenuAction(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  await ensureOwnership(restaurantId);

  const parsed = menuSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/dashboard?error=${encodeURIComponent(error)}`);
  }

  await createMenu(restaurantId, parsed.data.name);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteMenuAction(id: string, restaurantId: string) {
  await ensureOwnership(restaurantId);
  await deleteMenu(id);
  revalidatePath("/dashboard");
}
