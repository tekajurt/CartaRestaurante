import BetterSqlite3 from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "restaurant.db");

type DB = InstanceType<typeof BetterSqlite3>;

let db: DB | null = null;

export function getDB(): DB {
  if (!db) {
    db = new BetterSqlite3(dbPath);
    db.pragma("journal_mode = WAL");
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db!;

  // Create users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Drop old menu_items schema (v0 single-restaurant)
  database.exec(`DROP TABLE IF EXISTS menu_items`);

  // Create restaurants table
  database.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      theme TEXT NOT NULL DEFAULT 'default',
      accent_color TEXT DEFAULT '#f59e0b',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create menus table
  database.exec(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      menu_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(restaurant_id, menu_number),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `);

  // Create menu_items table
  database.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      menu_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      category TEXT NOT NULL,
      available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
    CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
    CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
  `);
}
