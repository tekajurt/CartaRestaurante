import { getSQL } from "./init";
import { randomUUID } from "crypto";
import crypto from "crypto";

export type User = {
  id: string;
  email: string;
  created_at: string;
};

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512").toString("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  const newHash = hashPassword(password);
  return newHash === hash;
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
  return (rows[0] as (User & { password_hash: string })) ?? null;
}

export async function createUser(email: string, password: string): Promise<User> {
  const sql = await getSQL();
  const id = randomUUID();
  const passwordHash = hashPassword(password);

  await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${passwordHash})`;

  return {
    id,
    email,
    created_at: new Date().toISOString(),
  };
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }

  const { password_hash: _passwordHash, ...userWithoutPassword } = user;
  void _passwordHash;
  return userWithoutPassword;
}
