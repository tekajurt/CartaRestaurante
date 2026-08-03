import { getSQL } from "./init";
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

export async function generateUniqueSlug(name: string, existingId?: string): Promise<string> {
  const sql = await getSQL();
  const base = slugify(name) || "restaurante";
  let slug = base;
  let counter = 1;

  while (true) {
    const rows = existingId
      ? await sql`SELECT id FROM restaurants WHERE slug = ${slug} AND id != ${existingId}`
      : await sql`SELECT id FROM restaurants WHERE slug = ${slug}`;
    if (rows.length === 0) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createRestaurant(input: RestaurantInput): Promise<Restaurant> {
  const sql = await getSQL();
  const id = randomUUID();
  const slug = input.slug || (await generateUniqueSlug(input.name));

  await sql`
    INSERT INTO restaurants (id, slug, name, description, theme, accent_color, is_active)
    VALUES (${id}, ${slug}, ${input.name}, ${input.description ?? ""}, ${input.theme ?? "default"}, ${input.accent_color ?? "#f59e0b"}, ${input.is_active ?? true})
  `;

  return { id, slug, name: input.name, description: input.description ?? "", theme: input.theme ?? "default", accent_color: input.accent_color ?? "#f59e0b", is_active: input.is_active ?? true, created_at: new Date().toISOString() };
}

export async function updateRestaurant(id: string, input: Partial<RestaurantInput>): Promise<Restaurant> {
  const sql = await getSQL();
  const existing = await getRestaurantById(id);
  if (!existing) throw new Error("Restaurant not found");

  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;

  if (input.name !== undefined) { sets.push(`name = $${n++}`); values.push(input.name); }
  if (input.description !== undefined) { sets.push(`description = $${n++}`); values.push(input.description); }
  if (input.theme !== undefined) { sets.push(`theme = $${n++}`); values.push(input.theme); }
  if (input.accent_color !== undefined) { sets.push(`accent_color = $${n++}`); values.push(input.accent_color); }
  if (input.is_active !== undefined) { sets.push(`is_active = $${n++}`); values.push(input.is_active); }

  if (input.name !== undefined) {
    const newSlug = input.slug || (await generateUniqueSlug(input.name, id));
    sets.push(`slug = $${n++}`);
    values.push(newSlug);
  } else if (input.slug !== undefined) {
    sets.push(`slug = $${n++}`);
    values.push(input.slug);
  }

  if (sets.length === 0) return existing;

  values.push(id);
  await sql.query(`UPDATE restaurants SET ${sets.join(", ")} WHERE id = $${n++}`, values);

  return (await getRestaurantById(id))!;
}

export async function deleteRestaurant(id: string): Promise<void> {
  const sql = await getSQL();
  await sql`DELETE FROM restaurants WHERE id = ${id}`;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants WHERE id = ${id}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants WHERE slug = ${slug}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, slug, name, description, theme, accent_color, is_active, created_at FROM restaurants ORDER BY created_at DESC`;
  return rows.map(r => mapRow(r as Record<string, unknown>));
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
