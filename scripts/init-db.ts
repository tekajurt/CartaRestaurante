#!/usr/bin/env node
import { getSQL } from "../src/lib/db/init";
import { createUser } from "../src/lib/db/auth";
import { createRestaurant } from "../src/lib/db/restaurant";
import { createMenu } from "../src/lib/db/menu";
import { addMenuItem } from "../src/lib/db/menuItem";

async function main() {
  await getSQL();

  console.log("Inicializando base de datos...");
  console.log("✓ Conexión PostgreSQL establecida");

  // Create a test admin user
  let adminUser;
  try {
    adminUser = await createUser("admin@restaurant.local", "admin123");
    console.log("✓ Admin creado:", adminUser.email);
    console.log("✓ Usuario de prueba creado:");
    console.log(`  Email: admin@restaurant.local`);
    console.log(`  Contraseña: admin123`);
    console.log(`  Puedes cambiar esta contraseña después de iniciar sesión`);
  } catch (error) {
    if ((error as Error).message.includes("duplicate key")) {
      console.log("✓ Usuario de prueba ya existe");
    } else {
      console.error("✗ Error al crear usuario de prueba:", error);
    }
  }

  // Create sample restaurants
  const restaurants = [
    {
      name: "La Trattoria",
      description: "Auténtica cocina italiana con recetas tradicionales.",
      theme: "default",
      accent_color: "#f59e0b",
      menus: [
        {
          name: "Carta Principal",
          items: [
            { name: "Ensalada César", description: "Lechuga romana, crutones y queso parmesano", price: 8.99, category: "Entradas", available: true },
            { name: "Bruschetta", description: "Pan tostado con tomate y albahaca", price: 6.50, category: "Entradas", available: true },
            { name: "Spaghetti Carbonara", description: "Pasta con panceta, huevo y queso pecorino", price: 12.99, category: "Platos Principales", available: true },
            { name: "Pizza Margherita", description: "Tomate, mozzarella y albahaca fresca", price: 11.99, category: "Platos Principales", available: true },
            { name: "Tiramisú", description: "Postre italiano con café y mascarpone", price: 6.99, category: "Postres", available: true },
          ],
        },
        {
          name: "Menú del Día",
          items: [
            { name: "Sopa del Día", description: "Consulte a su camarero", price: 4.99, category: "Entradas", available: true },
            { name: "Pollo al Horno", description: "Pollo asado con patatas y verduras", price: 10.99, category: "Platos Principales", available: true },
            { name: "Flan", description: "Flan casero con caramelo", price: 3.99, category: "Postres", available: true },
          ],
        },
      ],
    },
    {
      name: "Burger House",
      description: "Hamburguesas gourmet y cócteles artesanales.",
      theme: "modern",
      accent_color: "#10b981",
      menus: [
        {
          name: "Carta",
          items: [
            { name: "Classic Burger", description: "Carne de res, lechuga, tomate y queso cheddar", price: 9.99, category: "Hamburguesas", available: true },
            { name: "BBQ Burger", description: "Carne de res, cebolla caramelizada y salsa BBQ", price: 11.99, category: "Hamburguesas", available: true },
            { name: "Papas Fritas", description: "Papas crujientes con salsa especial", price: 4.50, category: "Acompañamientos", available: true },
            { name: "Limonada", description: "Limonada fresca hecha en casa", price: 3.50, category: "Bebidas", available: true },
          ],
        },
      ],
    },
  ];

  for (const data of restaurants) {
    try {
      const restaurant = await createRestaurant({
        name: data.name,
        description: data.description,
        theme: data.theme,
        accent_color: data.accent_color,
        is_active: true,
      });
      console.log(`✓ Restaurante creado: ${restaurant.name} (/${restaurant.slug})`);

      for (const menuData of data.menus) {
        const menu = await createMenu(restaurant.id, menuData.name);
        console.log(`  ✓ Menú creado: ${menu.name} (#${menu.menu_number})`);

        for (const item of menuData.items) {
          await addMenuItem(menu.id, item);
        }
        console.log(`    ✓ ${menuData.items.length} platos agregados`);
      }
    } catch (error) {
      console.error(`✗ Error al crear ${data.name}:`, error);
    }
  }

  console.log("\n✓ Inicialización completada");
  console.log("\nURLs de ejemplo:");
  console.log("  /la-trattoria");
  console.log("  /la-trattoria/menu/1");
  console.log("  /burger-house");
  console.log("  /burger-house/menu/1");
}

main().catch(console.error);
