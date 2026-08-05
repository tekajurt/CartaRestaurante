"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/db/session";
import { restaurantSchema } from "@/lib/validations";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurants,
  getRestaurantById,
} from "@/lib/db/restaurant";

export async function getRestaurantsAction() {
  await requireAuth();
  return await getRestaurants();
}

export async function createRestaurantAction(formData: FormData) {
  await requireAuth("admin");

  const parsed = restaurantSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    theme: formData.get("theme"),
    accent_color: formData.get("accent_color"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/new?error=${encodeURIComponent(error)}`);
  }

  const restaurant = await createRestaurant(parsed.data);
  revalidatePath("/admin");
  redirect(`/admin/restaurants/${restaurant.id}/menus`);
}

export async function updateRestaurantAction(id: string, formData: FormData) {
  await requireAuth("admin");

  const parsed = restaurantSchema.partial().safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    theme: formData.get("theme"),
    accent_color: formData.get("accent_color"),
    is_active: formData.get("is_active"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/restaurants/${id}/edit?error=${encodeURIComponent(error)}`);
  }

  await updateRestaurant(id, parsed.data);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteRestaurantAction(id: string) {
  await requireAuth("admin");
  await deleteRestaurant(id);
  revalidatePath("/admin");
}

export async function getRestaurantAction(id: string) {
  await requireAuth();
  return await getRestaurantById(id);
}
