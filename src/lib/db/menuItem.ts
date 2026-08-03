import { getSQL } from "./init";
import { randomUUID } from "crypto";
import type { MenuItem, MenuItemInput } from "@/types";

export type { MenuItem, MenuItemInput };

export async function addMenuItem(menuId: string, item: Omit<MenuItemInput, "menu_id">): Promise<MenuItem> {
  const sql = await getSQL();
  const id = randomUUID();

  await sql`
    INSERT INTO menu_items (id, menu_id, name, description, price, category, available)
    VALUES (${id}, ${menuId}, ${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.available})
  `;

  return { id, menu_id: menuId, name: item.name, description: item.description, price: item.price, category: item.category, available: item.available, created_at: new Date().toISOString() };
}

export async function updateMenuItem(id: string, item: Partial<Omit<MenuItemInput, "menu_id">>): Promise<MenuItem> {
  const sql = await getSQL();
  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;

  if (item.name !== undefined) { sets.push(`name = $${n++}`); values.push(item.name); }
  if (item.description !== undefined) { sets.push(`description = $${n++}`); values.push(item.description); }
  if (item.price !== undefined) { sets.push(`price = $${n++}`); values.push(item.price); }
  if (item.category !== undefined) { sets.push(`category = $${n++}`); values.push(item.category); }
  if (item.available !== undefined) { sets.push(`available = $${n++}`); values.push(item.available); }

  if (sets.length === 0) return (await getMenuItemById(id))!;

  values.push(id);
  await sql.query(`UPDATE menu_items SET ${sets.join(", ")} WHERE id = $${n++}`, values);

  return (await getMenuItemById(id))!;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const sql = await getSQL();
  await sql`DELETE FROM menu_items WHERE id = ${id}`;
}

export async function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  const sql = await getSQL();
  const existing = await getMenuItemById(id);
  if (!existing) throw new Error("Menu item not found");
  await sql`UPDATE menu_items SET available = ${!existing.available} WHERE id = ${id}`;
  return (await getMenuItemById(id))!;
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE id = ${id}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getMenuItemsByMenu(menuId: string): Promise<MenuItem[]> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE menu_id = ${menuId} ORDER BY category ASC, name ASC`;
  return rows.map(r => mapRow(r as Record<string, unknown>));
}

export async function getMenuItemsByMenuPublic(menuId: string): Promise<MenuItem[]> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE menu_id = ${menuId} AND available = TRUE ORDER BY category ASC, name ASC`;
  return rows.map(r => mapRow(r as Record<string, unknown>));
}

function mapRow(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    menu_id: row.menu_id as string,
    name: row.name as string,
    description: row.description as string,
    price: row.price as number,
    category: row.category as string,
    available: Boolean(row.available),
    created_at: row.created_at as string,
  };
}
