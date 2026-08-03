import { getDB } from "./init";
import { randomUUID } from "crypto";
import type { Menu } from "@/types";

export type { Menu };

export function getNextMenuNumber(restaurantId: string): number {
  const db = getDB();
  const stmt = db.prepare("SELECT COALESCE(MAX(menu_number), 0) + 1 AS next_number FROM menus WHERE restaurant_id = ?");
  const row = stmt.get(restaurantId) as { next_number: number } | undefined;
  return row?.next_number ?? 1;
}

export function createMenu(restaurantId: string, name: string): Menu {
  const db = getDB();
  const id = randomUUID();
  const menuNumber = getNextMenuNumber(restaurantId);

  const stmt = db.prepare(`
    INSERT INTO menus (id, restaurant_id, menu_number, name)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id, restaurantId, menuNumber, name);

  return { id, restaurant_id: restaurantId, menu_number: menuNumber, name, is_active: true, created_at: new Date().toISOString() };
}

export function updateMenu(id: string, name: string): Menu {
  const db = getDB();
  const stmt = db.prepare("UPDATE menus SET name = ? WHERE id = ?");
  stmt.run(name, id);
  return getMenuById(id)!;
}

export function deleteMenu(id: string): void {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM menus WHERE id = ?");
  stmt.run(id);
}

export function getMenuById(id: string): Menu | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE id = ?");
  const row = stmt.get(id) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function getMenuByNumber(restaurantId: string, menuNumber: number): Menu | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ? AND menu_number = ?");
  const row = stmt.get(restaurantId, menuNumber) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export function getMenusByRestaurant(restaurantId: string): Menu[] {
  const db = getDB();
  const stmt = db.prepare("SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ? ORDER BY menu_number ASC");
  const rows = stmt.all(restaurantId) as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getMenuByRestaurantAndNumber(restaurantId: string, menuNumber: number): Menu | null {
  const db = getDB();
  const stmt = db.prepare("SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ? AND menu_number = ?");
  const row = stmt.get(restaurantId, menuNumber) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

function mapRow(row: Record<string, unknown>): Menu {
  return {
    id: row.id as string,
    restaurant_id: row.restaurant_id as string,
    menu_number: row.menu_number as number,
    name: row.name as string,
    is_active: Boolean(row.is_active),
    created_at: row.created_at as string,
  };
}
