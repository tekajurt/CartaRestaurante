# AGENTS.md — src/lib/db

## Overview
Capa de persistencia y autenticación basada en SQLite (`better-sqlite3`). Soporta múltiples restaurantes, menús y platos.

## Structure
```
src/lib/db/
├── init.ts         # Singleton Database + creación de tablas + WAL
├── restaurant.ts   # CRUD de restaurants
├── menu.ts         # CRUD de menus
├── menuItem.ts     # CRUD de menu_items
├── auth.ts         # Usuarios y hashing PBKDF2
├── session.ts      # Sesiones JWT (cookie auth_token)
├── jwt.ts          # Codificación/decodificación JWT manual
└── index.ts        # Barrel exports
```

## Where to Look
| Task | Location |
|------|----------|
| Conexión SQLite y schema | `init.ts` |
| Queries de restaurantes | `restaurant.ts` |
| Queries de menús | `menu.ts` |
| Queries de platos | `menuItem.ts` |
| Hash/verificación de passwords | `auth.ts` |
| Crear/validar/eliminar sesión | `session.ts` |
| Codificar/decodificar JWT | `jwt.ts` |

## Conventions
- `getDB()` es un singleton: abre `restaurant.db` en la raíz del proyecto la primera vez.
- `better-sqlite3` opera de forma sincrónica (`prepare`, `run`, `get`, `all`).
- Las tablas se crean con `CREATE TABLE IF NOT EXISTS` en `initializeSchema()`.
- `restaurants.slug` es único y se genera automáticamente desde el nombre.
- `menus.menu_number` es secuencial por restaurante.
- El módulo expone barrel exports desde `index.ts`.

## Anti-Patterns
- **Sal fija en PBKDF2**. `auth.ts` usa `"salt"` para todos los usuarios; debería ser una sal aleatoria por usuario.
- **Iteraciones bajas**. `1000` iteraciones de PBKDF2; recomendación actual es mucho mayor.
- **Hashing sincrónico**. `pbkdf2Sync` bloquea el event loop; prefere la versión asíncrona.
- **SELECT ***. `menu.ts` y `auth.ts` usan `SELECT *`; usa columnas explícitas.
- **SQL dinámico en update**. `updateRestaurant` construye `SET col = ?` en runtime; las claves son controladas internamente.
- **DB sin cerrar**. No hay handler de cierre graceful (`db.close()`).
- **Archivo DB en raíz**. `restaurant.db` puede quedar expuesto en deploys con filesystem compartido.

## Notes
- `session.ts` lee/escribe la cookie `auth_token` con `cookies()` de `next/headers`.
- `session.ts` reconstruye `created_at` desde el claim `iat` del JWT, no desde la BD.
- `src/lib/jwt.ts` implementa JWT manualmente; usa `jose` en producción y obliga `JWT_SECRET` por env.
- `src/lib/db/index.ts` re-exporta todo; preferir importaciones explícitas para evitar ciclos futuros.
- Los tipos compartidos viven en `src/types/`.
