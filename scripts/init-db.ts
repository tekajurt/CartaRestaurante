#!/usr/bin/env node
import { getDB } from "../src/lib/db/init";
import { createUser } from "../src/lib/db/auth";

const db = getDB();

console.log("Inicializando base de datos...");
console.log("✓ Base de datos SQLite3 inicializada");

// Create a test user
try {
  const testUser = createUser("admin@restaurant.local", "admin123");
  console.log("✓ Usuario de prueba creado:");
  console.log(`  Email: admin@restaurant.local`);
  console.log(`  Contraseña: admin123`);
  console.log(`  Puedes cambiar esta contraseña después de iniciar sesión`);
} catch (error) {
  if ((error as any).message.includes("UNIQUE constraint failed")) {
    console.log("✓ Usuario de prueba ya existe");
  } else {
    console.error("✗ Error al crear usuario de prueba:", error);
  }
}
// add items to menu
try {
    db.exec(`
        INSERT INTO menu_items (id, name, description, price, category, available)
        VALUES
        ('1', 'Ensalada César', 'Lechuga romana, crutones, queso parmesano y aderezo César', 8.99, 'Ensaladas', 1),
        ('2', 'Pizza Margherita', 'Tomate, mozzarella, albahaca fresca y aceite de oliva', 12.99, 'Pizzas', 1),
        ('3', 'Spaghetti Carbonara', 'Pasta, panceta, huevo, queso pecorino y pimienta negra', 10.99, 'Pastas', 1),
        ('4', 'Tiramisu', 'Postre italiano con capas de bizcocho, café y crema de mascarpone', 6.99, 'Postres', 1)
    `);
    console.log("✓ Menú de prueba inicializado");
} catch (error) {
    if ((error as any).message.includes("UNIQUE constraint failed")) {
        console.log("✓ Menú de prueba ya existe");
    }
    else {
        console.error("✗ Error al inicializar menú de prueba:", error);
    }   
}

console.log("\n✓ Inicialización completada");
