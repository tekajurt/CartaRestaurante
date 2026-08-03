# Migración a Neon PostgreSQL (Vercel)

Este proyecto fue migrado de **SQLite** (`better-sqlite3`) a **Neon PostgreSQL** (`@neondatabase/serverless`) para despliegue en Vercel.

## Historial de migraciones

1. **Supabase → SQLite**: migración inicial a persistencia local con `better-sqlite3` y CMS generador de menús.
2. **SQLite → Neon PostgreSQL**: migración a PostgreSQL serverless para compatibilidad con Vercel y entornos sin filesystem persistente.

## Cambios clave (SQLite → Neon)

| Aspecto | SQLite (antes) | Neon PostgreSQL (ahora) |
|---------|---------------|------------------------|
| Driver | `better-sqlite3` | `@neondatabase/serverless` |
| Conexión | `getDB()` — archivo `restaurant.db` | `getSQL()` async — `DATABASE_URL` |
| Queries | Sincrónicas (`stmt.get()`, `stmt.all()`) | Async tagged templates (`await sql`...``) |
| Schema | SQLite dialect | PostgreSQL dialect (`TIMESTAMPTZ`, `BOOLEAN`) |
| Config DB | Sin env var | `DATABASE_URL` requerida |
| `JWT_SECRET` | Fallback hardcodeado | Requerido (lanza error si falta) |
| Archivos legacy | `src/lib/supabase/`, `src/proxy.ts`, `database/setup.sql` | Eliminados |
| Build | Solo `next build` | `vercel-build`: build + seed |

## Estado actual

- Base de datos Neon PostgreSQL serverless. Conexión vía HTTP con pooling automático.
- Autenticación propia con email/contraseña y sesiones JWT en cookies HTTP-only.
- Un único usuario admin (sin registro público).
- Múltiples restaurantes, cada uno con múltiples menús.
- Páginas públicas generadas por restaurante:
  - `/{restaurantSlug}` — landing page simple.
  - `/{restaurantSlug}/menu/{menuNumber}` — menú funcional.
- Sistema de plantillas extensible en `src/themes/`.

## Modelo de datos

```sql
restaurants(
  id, slug, name, description, theme, accent_color, is_active, created_at
)

menus(
  id, restaurant_id, menu_number, name, is_active, created_at
)

menu_items(
  id, menu_id, name, description, price, category, available, created_at
)

users(
  id, email, password_hash, created_at
)
```

## Cómo usar

### Instalación

```bash
npm install
```

### Inicialización de la base de datos

```bash
npm run init-db
```

Credenciales de prueba:

- Email: `admin@restaurant.local`
- Contraseña: `admin123`

Esto crea también dos restaurantes de ejemplo con menús y platos.

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/admin`.

### URLs de ejemplo

- Admin: `/admin`
- Landing: `/la-trattoria`
- Menú: `/la-trattoria/menu/1`

### Producción

```bash
npm run build
npm start
```

Para Vercel, el script `vercel-build` ejecuta `next build && npm run init-db`.

## Variables de entorno

- `DATABASE_URL` — URL de conexión a Neon PostgreSQL. **Requerida** en todos los entornos.
- `JWT_SECRET` — clave para firmar tokens JWT. **Requerida**; ya no tiene fallback hardcodeado.

## Notas

- No hay archivos de BD locales; toda la persistencia está en Neon PostgreSQL.
- No se usan variables `NEXT_PUBLIC_*` para la BD; las credenciales nunca se exponen al cliente.
- Los archivos legacy `src/lib/supabase/`, `src/proxy.ts` y `database/setup.sql` fueron eliminados.
- El schema se crea automáticamente en el primer `await getSQL()` (`CREATE TABLE IF NOT EXISTS`).
- **Advertencia**: `init.ts` ejecuta `DROP TABLE IF EXISTS menu_items` en cada arranque frío, lo que destruye los platos en cada cold start del serverless.
