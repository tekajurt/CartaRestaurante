import { getDB } from "./init";
import { randomUUID } from "crypto";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  created_at: string;
};

// Menu Items operations
export function getMenuItems(): MenuItem[] {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT * FROM menu_items 
    ORDER BY category ASC, name ASC
  `);
  return stmt.all() as MenuItem[];
}

export function getAvailableMenuItems(): MenuItem[] {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT * FROM menu_items 
    WHERE available = 1
    ORDER BY category ASC, name ASC
  `);
  return stmt.all() as MenuItem[];
}

export function addMenuItem(item: Omit<MenuItem, "id" | "created_at">): MenuItem {
  const db = getDB();
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, category, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, item.name, item.description, item.price, item.category, item.available ? 1 : 0);
  
  return {
    ...item,
    id,
    created_at: new Date().toISOString(),
  };
}

export function updateMenuItem(id: string, item: Partial<Omit<MenuItem, "id" | "created_at">>): void {
  const db = getDB();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (item.name !== undefined) {
    updates.push("name = ?");
    values.push(item.name);
  }
  if (item.description !== undefined) {
    updates.push("description = ?");
    values.push(item.description);
  }
  if (item.price !== undefined) {
    updates.push("price = ?");
    values.push(item.price);
  }
  if (item.category !== undefined) {
    updates.push("category = ?");
    values.push(item.category);
  }
  if (item.available !== undefined) {
    updates.push("available = ?");
    values.push(item.available ? 1 : 0);
  }
  
  values.push(id);
  
  const stmt = db.prepare(`UPDATE menu_items SET ${updates.join(", ")} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteMenuItem(id: string): void {
  const db = getDB();
  const stmt = db.prepare("DELETE FROM menu_items WHERE id = ?");
  stmt.run(id);
}

export function toggleMenuItemAvailability(id: string, available: boolean): void {
  const db = getDB();
  const stmt = db.prepare("UPDATE menu_items SET available = ? WHERE id = ?");
  stmt.run(available ? 1 : 0, id);
}
