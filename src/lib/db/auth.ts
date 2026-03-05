import { getDB } from "./init";
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

export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  const db = getDB();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as (User & { password_hash: string }) | null;
}

export function createUser(email: string, password: string): User {
  const db = getDB();
  const id = randomUUID();
  const passwordHash = hashPassword(password);
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(id, email, passwordHash);
  
  return {
    id,
    email,
    created_at: new Date().toISOString(),
  };
}

export function verifyUserPassword(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  if (!verifyPassword(password, user.password_hash)) {
    return null;
  }
  
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
