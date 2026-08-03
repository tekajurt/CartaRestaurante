# Migración de Supabase a SQLite + CMS generador de menús

Este proyecto fue migrado de **Supabase** a **SQLite** y evolucionado a un **CMS generador de páginas de menú**.

## Estado actual

- Base de datos local SQLite (`better-sqlite3`) en `restaurant.db`.
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

## Variables de entorno

- `JWT_SECRET` — clave para firmar tokens JWT. En producción debe establecerse explícitamente.

## Notas

- `restaurant.db` y sus archivos `-shm`/`-wal` están en `.gitignore`; no deben versionarse.
- No se usan variables `NEXT_PUBLIC_SUPABASE_*`; toda la persistencia es SQLite local.
- `database/setup.sql` es legacy de Supabase y no se utiliza.
