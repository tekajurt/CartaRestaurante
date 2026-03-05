import { cookies } from "next/headers";
import { jwtDecode, jwtEncode } from "@/lib/jwt";
import { User } from "./auth";

const SESSION_COOKIE = "auth_token";
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
    const payload = jwtDecode(token) as any;
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      created_at: new Date(payload.iat * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
