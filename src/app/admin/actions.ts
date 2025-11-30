"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  created_at: string;
};

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return data || [];
}

export async function addMenuItem(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const item = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category") as string,
    available: true,
  };

  const { error } = await supabase.from("menu_items").insert(item);

  if (error) {
    console.error("Error adding menu item:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/carta");
}

export async function updateMenuItem(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const item = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string),
    category: formData.get("category") as string,
    available: formData.get("available") === "true",
  };

  const { error } = await supabase
    .from("menu_items")
    .update(item)
    .eq("id", id);

  if (error) {
    console.error("Error updating menu item:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/carta");
}

export async function deleteMenuItem(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting menu item:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/carta");
}

export async function toggleAvailability(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const available = formData.get("available") === "true";

  const { error } = await supabase
    .from("menu_items")
    .update({ available: !available })
    .eq("id", id);

  if (error) {
    console.error("Error toggling availability:", error);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/carta");
}
