"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/db/session";
import { createRestaurantAccount, updateRestaurantAccount, deleteUser, getRestaurantAccounts, getUserById } from "@/lib/db/auth";
import { accountSchema } from "@/lib/validations";

export async function getAccountsAction() {
  await requireAuth("admin");
  return await getRestaurantAccounts();
}

export async function createAccountAction(formData: FormData) {
  await requireAuth("admin");

  const parsed = accountSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    restaurant_id: formData.get("restaurant_id"),
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/accounts?error=${encodeURIComponent(error)}`);
  }

  await createRestaurantAccount(parsed.data);
  revalidatePath("/admin/accounts");
  redirect("/admin/accounts");
}

export async function updateAccountAction(id: string, formData: FormData) {
  await requireAuth("admin");

  const parsed = accountSchema.partial().safeParse({
    username: formData.get("username") || undefined,
    password: formData.get("password") || undefined,
    restaurant_id: formData.get("restaurant_id") || undefined,
  });

  if (!parsed.success) {
    const error = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/admin/accounts?error=${encodeURIComponent(error)}`);
  }

  await updateRestaurantAccount(id, parsed.data);
  revalidatePath("/admin/accounts");
  redirect("/admin/accounts");
}

export async function deleteAccountAction(id: string) {
  await requireAuth("admin");
  await deleteUser(id);
  revalidatePath("/admin/accounts");
}

export async function getAccountAction(id: string) {
  await requireAuth("admin");
  return await getUserById(id);
}
