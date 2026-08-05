"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyUserPassword } from "@/lib/db/auth";
import { createSession, deleteSession } from "@/lib/db/session";

export async function login(formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  const user = await verifyUserPassword(identifier, password);

  if (!user) {
    redirect("/login?error=Credenciales incorrectas");
  }

  await createSession(user);

  revalidatePath("/", "layout");
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function signout() {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
