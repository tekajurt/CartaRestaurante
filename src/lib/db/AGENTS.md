# AGENTS.md — src/lib/db

## Overview
Capa de persistencia y autenticación sobre Neon PostgreSQL (`@neondatabase/serverless`). Sin ORM: SQL tagged templates con `mapRow` helpers locales.

## Structure
```
src/lib/db/
├── init.ts         # getSQL() singleton + CREATE TABLE/INDEX + DROP TABLE bug
├── restaurant.ts   # CRUD restaurantes + slugify + generateUniqueSlug
├── menu.ts         # CRUD menús (menu_number secuencial por restaurante)
├── menuItem.ts     # CRUD platos + toggle availability
├── auth.ts         # Usuarios, PBKDF2 hash/verify
├── session.ts      # Sesiones vía cookie auth_token (JWT)
└── index.ts        # Barrel (no usado por la app)
```

Plus `src/lib/jwt.ts` (fuera de `db/`): encode/decode JWT manual HS256.

## Where to Look

| Task | Location |
|------|----------|
| Conexión + schema | `init.ts` → `getSQL()` |
| Queries restaurante | `restaurant.ts` → `getRestaurantBySlug`, `createRestaurant`, etc. |
| Queries menú | `menu.ts` → `getMenuByNumber`, `createMenu`, etc. |
| Queries plato | `menuItem.ts` → `addMenuItem`, `toggleMenuItemAvailability`, etc. |
| Hash password | `auth.ts` → `hashPassword`, `verifyUserPassword` |
| Sesión | `session.ts` → `createSession`, `getSessionUser`, `deleteSession`, `requireAuth` |
| JWT | `jwt.ts` → `jwtEncode`, `jwtDecode` |

## Conventions

- **`getSQL()` singleton async.** Conexión Neon vía `DATABASE_URL`, ejecuta `initializeSchema()` en primera llamada. Lanza si `DATABASE_URL` no está definida.
- **SQL tagged templates.** `const rows = await sql\`SELECT ...\``. Sin builder, sin ORM.
- **`mapRow` helper local por módulo.** `Record<string, unknown>` → tipo de dominio.
- **Tablas con `CREATE TABLE IF NOT EXISTS`.** Índices con `CREATE INDEX IF NOT EXISTS`.
- **Foreign keys con `ON DELETE CASCADE`.** `menus` → `restaurants`, `menu_items` → `menus`.
- **`created_at` cliente.** `new Date().toISOString()` en vez de `DEFAULT NOW()` en BD.
- **Tipos en `src/types/`.** `Restaurant`, `Menu`, `MenuItem`, `User`, `RestaurantInput`, `MenuItemInput`.
- **Slug:** auto-generado desde nombre con `slugify` (Unicode NFKD + regex) + contador de colisión.

## Anti-Patterns

- **`DROP TABLE IF EXISTS menu_items` cada cold start** (`init.ts:29`). Destruye todos los platos en cada arranque frío. Condicionar a `NODE_ENV === "development"` o eliminar.
- **Sal fija `"salt"`** (`auth.ts:12`). Misma sal para todos los usuarios. Debe ser aleatoria por usuario, almacenada en BD.
- **1000 iteraciones PBKDF2** (`auth.ts:12`). OWASP recomienda >= 600k para SHA-512.
- **`pbkdf2Sync` síncrono** (`auth.ts:12`). Bloquea event loop. Usar `crypto.pbkdf2` async.
- **`SELECT *` en auth** (`auth.ts:22`). Expone `password_hash` en el tipo de retorno.
- **JWT manual** (`jwt.ts`). Sin `jose`/`jsonwebtoken`. Riesgo: timing attacks, bugs de firma.
- **`created_at` desde cliente** (5 archivos). Usar `DEFAULT NOW()` en BD para evitar drift de reloj.
- **SQL dinámico en updates** (`restaurant.ts:52-74`, `menuItem.ts:21-34`). Construcción de SET vía string array + positional params. Mantenible pero frágil.
- **`getMenuByRestaurantAndNumber` = `getMenuByNumber`** (`menu.ts:40` vs `52`). Código duplicado idéntico.
- **`.env` commiteado** con `DATABASE_URL` y `JWT_SECRET`.

## Notes

- `session.ts` lee/escribe cookie `auth_token` (httpOnly, SameSite Lax, 7 días). `createSession` la escribe, `deleteSession` la borra, `getSessionUser` la valida.
- `session.ts` reconstruye `created_at` desde claim `iat` del JWT, no desde BD.
- `requireAuth()` lanza `Error("Unauthorized")`; las páginas admin lo atrapan y redirigen.
- El barrel `index.ts` existe pero **no se usa**. Importar módulos directamente para evitar ciclos futuros.
- `initializeSchema()` se ejecuta en cada cold start. Solo `menu_items` recibe DROP (bug).
