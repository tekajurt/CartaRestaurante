import { getDB } from "./init";
import { randomUUID } from "crypto";
import type { MenuItem, MenuItemInput } from "@/types";

export type { MenuItem, MenuItemInput };

export function addMenuItem(menuId: string, item: Omit<MenuItemInput, "menu_id">): MenuItem {
  const db = getDB();
  const id = randomUUID();

  const stmt = db.prepare(`
    INSERT INTO menu_items (id, menu_id, name, description, price, category, available)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, menuId, item.name, item.description, item.price, item.category, item.available ? 1 : 0);

  return { id, menu_id: menuId, name: item.name, description: item.description, price: item.price, category: item.category, available: item.available, created_at: new Date().toISOString() };
}

export function updateMenuItem(id: string, item: Partial<Omit<MenuItemInput, "menu_id">>): MenuItem {
  const db = getDB();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (item.name !== undefined) { updates.push("name = ?"); values.push(item.name); }
  if (item.description !== undefined) { updates.push("description = ?"); values.push(item.description); }
  if (item.price !== undefined) { updates.push("price = ?"); values.push(item.price); }
  if (item.category !== undefined) { updates.push("category = ?"); values.push(item.category); }
  if (item.available !== undefined) { updates.push("available = ?"); values.push(item.available ? 1 : 0); }

  if (updates.length === 0) return getMenuItemById(id)!;

  values.push(id);
  const stmt = db.prepare(`UPDATE menu_items SET ${updates.join(", ")} WHERE id = ?`);
  stmt.run(...values);

  return getMenuItemById(id)!;
}

export function deleteMenuItem(id: string): void {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM menu_items WHERE id = ?");
  stmt.run(id);
}

export function toggleMenuItemAvailability(id: string): MenuItem {
  const db = getDB();
  const existing = getMenuItemById(id);
  if (!existing) throw new Error("Menu item not found");
  const stmt = db.prepare("UPDATE menu_items SET available = ? WHERE id = ?");
  stmt.run(existing.available ? 0 : 1, id);
  return getMenuItemById(id)!;
}

export function getMenuItemById(id: string): MenuItem | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function getMenuItemsByMenu(menuId: string): MenuItem[] {
  const db = getDB();
  const stmt = db.prepare("SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE menu_id = ? ORDER BY category ASC, name ASC");
  const rows = stmt.all(menuId) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getMenuItemsByMenuPublic(menuId: string): MenuItem[] {
  const db = getDB();
  const stmt = db.prepare("SELECT id, menu_id, name, description, price, category, available, created_at FROM menu_items WHERE menu_id = ? AND available = 1 ORDER BY category ASC, name ASC");
  const rows = stmt.all(menuId) as Record<string, unknown>[];
  return rows.map(mapRow);
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
