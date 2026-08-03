"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/db/session";
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurants,
  getRestaurantById,
} from "@/lib/db/restaurant";

const restaurantSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(["default", "modern"]).default("default"),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido").default("#f59e0b"),
  is_active: z.coerce.boolean().default(true),
});

export async function getRestaurantsAction() {
  await requireAuth();
  return await getRestaurants();
}

export async function createRestaurantAction(formData: FormData) {
  await requireAuth();

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
  await requireAuth();

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
  await requireAuth();
  await deleteRestaurant(id);
  revalidatePath("/admin");
}

export async function getRestaurantAction(id: string) {
  await requireAuth();
  return await getRestaurantById(id);
}
