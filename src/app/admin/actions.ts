"use server";

import { revalidatePath } from "next/cache";
import {
  getMenuItems as dbGetMenuItems,
  addMenuItem as dbAddMenuItem,
  updateMenuItem as dbUpdateMenuItem,
  deleteMenuItem as dbDeleteMenuItem,
  toggleMenuItemAvailability,
} from "@/lib/db/menu";

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
  try {
    return dbGetMenuItems();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export async function addMenuItem(formData: FormData): Promise<void> {
  try {
    const item = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      available: true,
    };

    dbAddMenuItem(item);

    revalidatePath("/admin");
    revalidatePath("/carta");
  } catch (error) {
    console.error("Error adding menu item:", error);
  }
}

export async function updateMenuItem(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id") as string;
    const item = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category") as string,
      available: formData.get("available") === "true",
    };

    dbUpdateMenuItem(id, item);

    revalidatePath("/admin");
    revalidatePath("/carta");
  } catch (error) {
    console.error("Error updating menu item:", error);
  }
}

export async function deleteMenuItem(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id") as string;
    dbDeleteMenuItem(id);

    revalidatePath("/admin");
    revalidatePath("/carta");
  } catch (error) {
    console.error("Error deleting menu item:", error);
  }
}

export async function toggleAvailability(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id") as string;
    const available = formData.get("available") === "true";

    toggleMenuItemAvailability(id, !available);

    revalidatePath("/admin");
    revalidatePath("/carta");
  } catch (error) {
    console.error("Error toggling availability:", error);
  }
}
