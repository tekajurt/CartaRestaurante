# AGENTS.md — src/lib/db

## Overview
Capa de persistencia y autenticación basada en Neon PostgreSQL (`@neondatabase/serverless`). Soporta múltiples restaurantes, menús y platos.

## Structure
```
src/lib/db/
├── init.ts         # Singleton async getSQL() + creación de tablas + índices
├── restaurant.ts   # CRUD de restaurants (async)
├── menu.ts         # CRUD de menus (async)
├── menuItem.ts     # CRUD de menu_items (async)
├── auth.ts         # Usuarios y hashing PBKDF2 (async)
├── session.ts      # Sesiones JWT (cookie auth_token)
├── jwt.ts          # Codificación/decodificación JWT manual
└── index.ts        # Barrel exports
```

## Where to Look
| Task | Location |
|------|----------|
| Conexión PostgreSQL y schema | `init.ts` |
| Queries de restaurantes | `restaurant.ts` |
| Queries de menús | `menu.ts` |
| Queries de platos | `menuItem.ts` |
| Hash/verificación de passwords | `auth.ts` |
| Crear/validar/eliminar sesión | `session.ts` |
| Codificar/decodificar JWT | `jwt.ts` |

## Conventions
- `getSQL()` es un singleton async: se conecta a Neon PostgreSQL usando `DATABASE_URL` y ejecuta `initializeSchema()` en la primera llamada.
- `DATABASE_URL` es requerida; el sistema lanza error si no está definida.
- Todas las queries son async y usan tagged templates: `const rows = await sql`SELECT * FROM ...``.
- Las tablas se crean con `CREATE TABLE IF NOT EXISTS` en `initializeSchema()`. Los índices usan `CREATE INDEX IF NOT EXISTS`.
- `restaurants.slug` es único y se genera automáticamente desde el nombre.
- `menus.menu_number` es secuencial por restaurante.
- El módulo expone barrel exports desde `index.ts`.
- Las queries usan `mapRow` helpers locales para convertir `Record<string, unknown>` al tipo de dominio.
- `created_at` se sintetiza con `new Date().toISOString()` en los inserts en lugar de leer el default de la BD.
- No hay pool de conexiones manual; `neon()` ya incluye connection pooling automático sobre HTTP.

## Anti-Patterns
- **Sal fija en PBKDF2**. `auth.ts` usa `"salt"` para todos los usuarios; debería ser una sal aleatoria por usuario.
- **Iteraciones bajas**. `1000` iteraciones de PBKDF2; recomendación actual es mucho mayor.
- **Hashing sincrónico**. `pbkdf2Sync` bloquea el event loop; preferir la versión asíncrona.
- **SELECT \***. `auth.ts` usa `SELECT *`; usar columnas explícitas.
- **SQL dinámico en update**. `updateRestaurant` y `updateMenuItem` construyen `SET` en runtime; las claves son controladas internamente.
- **`DROP TABLE IF EXISTS menu_items` en cada cold start**. La línea 29 de `init.ts` destruye todos los platos en cada arranque frío del serverless. Eliminar o condicionar a `NODE_ENV === "development"`.
- **`created_at` generado en cliente**. Usar `now()` en los inserts en lugar de `new Date().toISOString()` para evitar desfases de reloj entre el serverless y la BD.

## Notes
- `session.ts` lee/escribe la cookie `auth_token` con `cookies()` de `next/headers`.
- `session.ts` reconstruye `created_at` desde el claim `iat` del JWT, no desde la BD.
- `jwt.ts` implementa JWT manualmente; usar `jose` en producción. `JWT_SECRET` es requerido (lanza error si no está definido).
- `src/lib/db/index.ts` re-exporta todo; preferir importaciones explícitas para evitar ciclos futuros.
- Los tipos compartidos viven en `src/types/`.
