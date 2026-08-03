import { getSQL } from "./init";
import { randomUUID } from "crypto";
import type { Menu } from "@/types";

export type { Menu };

export async function getNextMenuNumber(restaurantId: string): Promise<number> {
  const sql = await getSQL();
  const rows = await sql`SELECT COALESCE(MAX(menu_number), 0) + 1 AS next_number FROM menus WHERE restaurant_id = ${restaurantId}`;
  return (rows[0] as { next_number: number } | undefined)?.next_number ?? 1;
}

export async function createMenu(restaurantId: string, name: string): Promise<Menu> {
  const sql = await getSQL();
  const id = randomUUID();
  const menuNumber = await getNextMenuNumber(restaurantId);

  await sql`INSERT INTO menus (id, restaurant_id, menu_number, name) VALUES (${id}, ${restaurantId}, ${menuNumber}, ${name})`;

  return { id, restaurant_id: restaurantId, menu_number: menuNumber, name, is_active: true, created_at: new Date().toISOString() };
}

export async function updateMenu(id: string, name: string): Promise<Menu> {
  const sql = await getSQL();
  await sql`UPDATE menus SET name = ${name} WHERE id = ${id}`;
  return (await getMenuById(id))!;
}

export async function deleteMenu(id: string): Promise<void> {
  const sql = await getSQL();
  await sql`DELETE FROM menus WHERE id = ${id}`;
}

export async function getMenuById(id: string): Promise<Menu | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE id = ${id}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getMenuByNumber(restaurantId: string, menuNumber: number): Promise<Menu | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ${restaurantId} AND menu_number = ${menuNumber}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getMenusByRestaurant(restaurantId: string): Promise<Menu[]> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ${restaurantId} ORDER BY menu_number ASC`;
  return rows.map(r => mapRow(r as Record<string, unknown>));
}

export async function getMenuByRestaurantAndNumber(restaurantId: string, menuNumber: number): Promise<Menu | null> {
  const sql = await getSQL();
  const rows = await sql`SELECT id, restaurant_id, menu_number, name, is_active, created_at FROM menus WHERE restaurant_id = ${restaurantId} AND menu_number = ${menuNumber}`;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
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
