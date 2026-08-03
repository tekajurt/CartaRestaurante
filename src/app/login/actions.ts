"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyUserPassword } from "@/lib/db/auth";
import { createSession, deleteSession } from "@/lib/db/session";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = verifyUserPassword(email, password);

  if (!user) {
    redirect("/login?error=Credenciales incorrectas");
  }

  await createSession(user);

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signup(_formData: FormData) {
  void _formData;
  // Registration is disabled in v1: only the seeded admin account is allowed.
  redirect("/login?error=El registro está deshabilitado");
}

export async function signOut() {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
