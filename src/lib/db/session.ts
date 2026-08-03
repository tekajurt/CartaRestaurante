import { cookies } from "next/headers";
import { jwtDecode, jwtEncode } from "@/lib/jwt";
import { User } from "./auth";

export const SESSION_COOKIE = "auth_token";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function createSession(user: User): Promise<string> {
  const token = jwtEncode({
    userId: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return token;
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode(token) as Record<string, unknown>;

    const exp = typeof payload.exp === "number" ? payload.exp : undefined;
    if (exp && exp * 1000 < Date.now()) {
      return null;
    }

    const iat = typeof payload.iat === "number" ? payload.iat : Date.now() / 1000;
    const userId = typeof payload.userId === "string" ? payload.userId : "";
    const email = typeof payload.email === "string" ? payload.email : "";

    return {
      id: userId,
      email,
      created_at: new Date(iat * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
