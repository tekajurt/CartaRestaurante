import { getDB } from "./init";
import { randomUUID } from "crypto";
import type { Restaurant, RestaurantInput } from "@/types";

export type { Restaurant, RestaurantInput };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateUniqueSlug(name: string, existingId?: string): string {
  const db = getDB();
  const base = slugify(name) || "restaurante";
  let slug = base;
  let counter = 1;

  while (true) {
    const stmt = existingId
      ? db.prepare("SELECT id FROM restaurants WHERE slug = ? AND id != ?")
      : db.prepare("SELECT id FROM restaurants WHERE slug = ?");
    const existing = existingId ? stmt.get(slug, existingId) : stmt.get(slug);
    if (!existing) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export function createRestaurant(input: RestaurantInput): Restaurant {
  const db = getDB();
  const id = randomUUID();
  const slug = input.slug || generateUniqueSlug(input.name);

  const stmt = db.prepare(`
    INSERT INTO restaurants (id, slug, name, description, theme, accent_color, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    slug,
    input.name,
    input.description ?? "",
    input.theme ?? "default",
    input.accent_color ?? "#f59e0b",
    input.is_active ? 1 : 0
  );

  return { id, slug, name: input.name, description: input.description ?? "", theme: input.theme ?? "default", accent_color: input.accent_color ?? "#f59e0b", is_active: input.is_active ?? true, created_at: new Date().toISOString() };
}

export function updateRestaurant(id: string, input: Partial<RestaurantInput>): Restaurant {
  const db = getDB();
  const existing = getRestaurantById(id);
  if (!existing) throw new Error("Restaurant not found");

  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    values.push(input.description);
  }
  if (input.theme !== undefined) {
    updates.push("theme = ?");
    values.push(input.theme);
  }
  if (input.accent_color !== undefined) {
    updates.push("accent_color = ?");
    values.push(input.accent_color);
  }
  if (input.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(input.is_active ? 1 : 0);
  }

  if (input.name !== undefined) {
    const newSlug = input.slug || generateUniqueSlug(input.name, id);
    updates.push("slug = ?");
    values.push(newSlug);
  } else if (input.slug !== undefined) {
    updates.push("slug = ?");
    values.push(input.slug);
  }

  if (updates.length === 0) return existing;

  values.push(id);
  const stmt = db.prepare(`UPDATE restaurants SET ${updates.join(", ")} WHERE id = ?`);
  stmt.run(...values);

  return getRestaurantById(id)!;
}

export function deleteRestaurant(id: string): void {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM restaurants WHERE id = ?");
  stmt.run(id);
}

export function getRestaurantById(id: string): Restaurant | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function getRestaurantBySlug(slug: string): Restaurant | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants WHERE slug = ?");
  const row = stmt.get(slug) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function getRestaurants(): Restaurant[] {
  const db = getDB();
  const stmt = db.prepare("SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants ORDER BY created_at DESC");
  const rows = stmt.all() as Record<string, unknown>[];
  return rows.map(mapRow);
}

function mapRow(row: Record<string, unknown>): Restaurant {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    theme: row.theme as string,
    accent_color: row.accent_color as string,
    is_active: Boolean(row.is_active),
    created_at: row.created_at as string,
  };
}
