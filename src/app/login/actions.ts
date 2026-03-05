"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyUserPassword, createUser, getUserByEmail } from "@/lib/db/auth";
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

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check if user already exists
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    redirect("/login?error=El email ya está registrado");
  }

  try {
    const user = createUser(email, password);
    await createSession(user);

    revalidatePath("/", "layout");
    redirect("/admin");
  } catch {
    redirect("/login?error=Error al registrarse");
  }
}

export async function signOut() {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
