import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sqlPromise: Promise<NeonQueryFunction<false, false>>;

export async function getSQL(): Promise<NeonQueryFunction<false, false>> {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is required");
      }
      const s = neon(process.env.DATABASE_URL);
      await initializeSchema(s);
      return s;
    })();
  }
  return sqlPromise;
}

async function initializeSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`DROP TABLE IF EXISTS menu_items`;

  await sql`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      theme TEXT NOT NULL DEFAULT 'default',
      accent_color TEXT DEFAULT '#f59e0b',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      menu_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(restaurant_id, menu_number),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      menu_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      category TEXT NOT NULL,
      available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)`;
}
