import { getSQL } from "./init";
import { randomUUID } from "crypto";
import crypto from "crypto";

export type UserRole = "admin" | "restaurant_owner";

export type User = {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  restaurant_id: string | null;
  created_at: string;
};

export type AccountInput = {
  username: string;
  password: string;
  restaurant_id: string;
};

type UserRow = Record<string, unknown>;

function mapUserRow(row: UserRow): User & { password_hash: string } {
  return {
    id: row.id as string,
    email: (row.email as string) ?? null,
    username: (row.username as string) ?? null,
    role: (row.role as UserRole) ?? "admin",
    restaurant_id: (row.restaurant_id as string) ?? null,
    password_hash: row.password_hash as string,
    created_at: row.created_at as string,
  };
}

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
  return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
}

export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT * FROM users WHERE username = ${username}`;
  return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
}

export async function createUser(email: string, password: string): Promise<User> {
  const sql = await getSQL();
  const id = randomUUID();
  const passwordHash = hashPassword(password);

  await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${passwordHash})`;

  return {
    id,
    email,
    username: null,
    role: "admin",
    restaurant_id: null,
    created_at: new Date().toISOString(),
  };
}

export async function createRestaurantAccount(input: AccountInput): Promise<User> {
  const sql = await getSQL();
  const id = randomUUID();
  const passwordHash = hashPassword(input.password);

  await sql`
    INSERT INTO users (id, username, password_hash, role, restaurant_id)
    VALUES (${id}, ${input.username}, ${passwordHash}, 'restaurant_owner', ${input.restaurant_id})
  `;

  return {
    id,
    email: null,
    username: input.username,
    role: "restaurant_owner",
    restaurant_id: input.restaurant_id,
    created_at: new Date().toISOString(),
  };
}

export async function updateRestaurantAccount(id: string, input: Partial<AccountInput>): Promise<User> {
  const sql = await getSQL();
  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;

  if (input.username !== undefined) {
    sets.push(`username = $${n++}`);
    values.push(input.username);
  }
  if (input.password !== undefined) {
    sets.push(`password_hash = $${n++}`);
    values.push(hashPassword(input.password));
  }
  if (input.restaurant_id !== undefined) {
    sets.push(`restaurant_id = $${n++}`);
    values.push(input.restaurant_id);
  }

  if (sets.length === 0) return (await getUserById(id))!;

  values.push(id);
  await sql.query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${n++}`, values);

  return (await getUserById(id))!;
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, email, username, role, restaurant_id, created_at FROM users WHERE id = ${id}`;
  if (!rows[0]) return null;
  const r = rows[0] as UserRow;
  return {
    id: r.id as string,
    email: (r.email as string) ?? null,
    username: (r.username as string) ?? null,
    role: (r.role as UserRole) ?? "admin",
    restaurant_id: (r.restaurant_id as string) ?? null,
    created_at: r.created_at as string,
  };
}

export async function getRestaurantAccounts(): Promise<User[]> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, email, username, role, restaurant_id, created_at FROM users WHERE role = 'restaurant_owner' ORDER BY created_at DESC`;
  return rows.map(r => {
    const row = r as UserRow;
    return {
      id: row.id as string,
      email: (row.email as string) ?? null,
      username: (row.username as string) ?? null,
      role: (row.role as UserRole) ?? "restaurant_owner",
      restaurant_id: (row.restaurant_id as string) ?? null,
      created_at: row.created_at as string,
    };
  });
}

export async function deleteUser(id: string): Promise<void> {
  const sql = await getSQL();
  await sql`DELETE FROM users WHERE id = ${id}`;
}

export async function verifyUserPassword(identifier: string, password: string): Promise<User | null> {
  const isEmail = identifier.includes("@");
  const user = isEmail
    ? await getUserByEmail(identifier)
    : await getUserByUsername(identifier);

  if (!user) return null;

  if (!verifyPassword(password, user.password_hash)) return null;

  const { password_hash: _discard, ...userWithoutPassword } = user;
  void _discard;
  return userWithoutPassword;
}
