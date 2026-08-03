# AGENTS.md — CartaRestaurante

## Overview
CMS generador de landing pages y páginas de menú para restaurantes. Next.js 16 App Router + React 19 + TypeScript 5 + Tailwind CSS v4. Persistencia en Neon PostgreSQL serverless (`@neondatabase/serverless`). Autenticación propia email/contraseña con sesiones JWT firmadas manualmente en cookies HTTP-only. Un único admin gestiona múltiples restaurantes; cada uno expone una landing pública y menús numerados renderizados por tema seleccionable.

## Structure
```
.
├── src/app/                    # Rutas, páginas y Server Actions
│   ├── page.tsx                # Redirige / → /admin
│   ├── layout.tsx              # Root layout + Geist fonts
│   ├── globals.css             # Tailwind v4 + variables CSS
│   ├── login/                  # Login (formAction dual: login + signup deshabilitado)
│   ├── admin/                  # Dashboard y CRUD de restaurantes
│   ├── admin/restaurants/      # CRUD restaurantes
│   ├── admin/restaurants/[id]/menus/           # CRUD menús
│   ├── admin/restaurants/[id]/menus/[menuNumber]/  # CRUD platos
│   ├── carta/                  # Vacío — ruta reservada/no usada
│   └── [restaurantSlug]/       # Landing + menú público
├── src/components/ui/          # Componentes reutilizables (ActionButton, etc.)
├── src/lib/db/                 # Neon PostgreSQL + auth + sesiones
│   ├── init.ts                 # Singleton async getSQL() + schema
│   ├── index.ts                # Barrel exports (preferir imports explícitos)
│   ├── restaurant.ts / menu.ts / menuItem.ts
│   ├── auth.ts / session.ts
│   └── jwt.ts                  # Implementación manual JWT HS256
├── src/themes/                 # Plantillas registradas (default, modern)
├── src/types/                  # Tipos compartidos
├── scripts/init-db.ts          # Seed inicial + admin de prueba
└── package.json
```

## Where to Look
| Task | Location |
|------|----------|
| Login / logout / signup (deshabilitado) | `src/app/login/actions.ts` |
| Dashboard + listado de restaurantes | `src/app/admin/page.tsx` |
| CRUD restaurantes | `src/app/admin/restaurants/actions.ts` |
| CRUD menús | `src/app/admin/restaurants/[id]/menus/actions.ts` |
| CRUD platos + toggle disponibilidad | `src/app/admin/restaurants/[id]/menus/[menuNumber]/actions.ts` |
| Landing pública | `src/app/[restaurantSlug]/page.tsx` |
| Menú público | `src/app/[restaurantSlug]/menu/[menuNumber]/page.tsx` |
| Conexión PostgreSQL y schema | `src/lib/db/init.ts` |
| Queries restaurantes | `src/lib/db/restaurant.ts` |
| Queries menús | `src/lib/db/menu.ts` |
| Queries platos | `src/lib/db/menuItem.ts` |
| Hashing / usuarios | `src/lib/db/auth.ts` |
| Sesiones JWT + cookies | `src/lib/db/session.ts` |
| Codificación/decodificación JWT | `src/lib/db/jwt.ts` |
| Registro de plantillas | `src/themes/index.ts` |
| Tipos compartidos | `src/types/` |
| Datos de prueba | `scripts/init-db.ts` |

## Code Map
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `getSQL` | Function | `src/lib/db/init.ts` | Singleton async Neon PostgreSQL + schema |
| `createRestaurant` / `updateRestaurant` / `deleteRestaurant` / `getRestaurantBySlug` | Functions | `src/lib/db/restaurant.ts` | CRUD restaurantes + slugify (async) |
| `createMenu` / `updateMenu` / `deleteMenu` / `getMenuByNumber` | Functions | `src/lib/db/menu.ts` | CRUD menús + secuencia por restaurante (async) |
| `addMenuItem` / `updateMenuItem` / `deleteMenuItem` / `toggleMenuItemAvailability` / `getMenuItemsByMenuPublic` | Functions | `src/lib/db/menuItem.ts` | CRUD platos + disponibilidad (async) |
| `createUser` / `verifyUserPassword` | Functions | `src/lib/db/auth.ts` | Hash PBKDF2 fijo + verificación (async) |
| `createSession` / `getSessionUser` / `deleteSession` / `requireAuth` | Functions | `src/lib/db/session.ts` | JWT en cookie `auth_token` |
| `jwtEncode` / `jwtDecode` | Functions | `src/lib/db/jwt.ts` | JWT manual HMAC-SHA256 |
| `login` / `signup` / `signOut` | Server Actions | `src/app/login/actions.ts` | Autenticación |
| `getRestaurantsAction` / `createRestaurantAction` / `updateRestaurantAction` / `deleteRestaurantAction` | Server Actions | `src/app/admin/restaurants/actions.ts` | Acciones restaurantes |
| `getRestaurantWithMenusAction` / `createMenuAction` / `updateMenuAction` / `deleteMenuAction` | Server Actions | `src/app/admin/restaurants/[id]/menus/actions.ts` | Acciones menús |
| `getMenuWithItemsAction` / `addMenuItemAction` / `updateMenuItemAction` / `deleteMenuItemAction` / `toggleMenuItemAvailabilityAction` | Server Actions | `src/app/admin/restaurants/[id]/menus/[menuNumber]/actions.ts` | Acciones platos |
| `AdminPage` | Page | `src/app/admin/page.tsx` | Dashboard + protección manual |
| `RestaurantLandingPage` | Page | `src/app/[restaurantSlug]/page.tsx` | Landing pública con tema |
| `RestaurantMenuPage` | Page | `src/app/[restaurantSlug]/menu/[menuNumber]/page.tsx` | Menú público con tema |
| `getTheme` / `themeList` | Functions | `src/themes/index.ts` | Registro explícito de plantillas |
| `ActionButton` | Component | `src/components/ui/ActionButton.tsx` | Botón con `useFormStatus` |

## Conventions
- App Router de Next.js: Server Components por defecto; `"use client"` solo para interacción.
- Server Actions en `actions.ts` junto a su ruta. Todas las acciones de admin inician con `await requireAuth()`.
- Alias `@/*` apunta a `src/*`.
- Tailwind v4 configurado vía `postcss.config.mjs` (`@tailwindcss/postcss`) y `@import "tailwindcss"` en `src/app/globals.css`.
- ESLint 9 flat config (`eslint.config.mjs`) con `eslint-config-next/core-web-vitals` + `typescript`.
- Base de datos: Neon PostgreSQL serverless vía `DATABASE_URL`. `getSQL()` es un singleton async que inicializa el schema automáticamente.
- Todas las queries DB son async y usan tagged templates (`await sql`...``). No hay operaciones sincrónicas.
- Tipos compartidos en `src/types/`. No importar `src/lib/db/*` en componentes cliente (arrastra `@neondatabase/serverless`).
- Plantillas en `src/themes/{slug}/` exportan `LandingPage`, `MenuPage` y `config`. Registro explícito en `src/themes/index.ts`.
- Formularios usan `formAction` de Server Actions. `ActionButton` reemplaza `button type="submit"` para mostrar estado de carga.
- Parámetros de rutas dinámicas son `Promise` (Next.js 15+).
- `DATABASE_URL` es requerida; el sistema lanza error si no está definida.

## Anti-Patterns (This Project)
- **No hay middleware global registrado**. La protección de `/admin` se repite página por página y las acciones re-autorizan con `requireAuth()`.
- **JWT implementado manualmente** en `src/lib/db/jwt.ts`. Reemplazar por `jose` en producción.
- **Hash PBKDF2 con sal fija e iteraciones bajas**: `crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512")`. Usar sal aleatoria y costo alto.
- **`DROP TABLE IF EXISTS menu_items` en cada arranque frío** (línea 29 de `init.ts`). Esto destruye todos los platos en cada cold start del serverless. Eliminar o condicionar a entorno de desarrollo.
- **Registro público deshabilitado en v1**: `signup` redirige con error. No hay flujo de alta de usuarios.
- **Sin rate limiting** en login ni en Server Actions.
- **No hay imágenes/logos** en v1. Planificado para v2.
- **Metadata por defecto de create-next-app** en `src/app/layout.tsx` (`title: "Create Next App"`). Actualizar.
- **Barrel file `src/lib/db/index.ts`** puede causar ciclos; preferir imports explícitos.
- **SQL dinámico en `updateRestaurant`** construye `SET` en runtime; las claves están controladas internamente.

## Unique Styles
- **Doble migración**: Supabase → SQLite → Neon PostgreSQL. Documentada en `MIGRATION.md`.
- **Sesión propia en cookie `auth_token`**: sin NextAuth, Supabase Auth ni librería JWT externa.
- **Sistema de plantillas con registro explícito**: evita imports dinámicos inseguros.
- **Multi-tenant simple**: un único admin gestiona múltiples restaurantes; cada restaurante tiene menús numerados.
- **Página `/carta` vacía**: reservada para futura funcionalidad o redirección; no hay rutas activas allí.
- **Nested AGENTS.md**: existen `src/app/AGENTS.md` y `src/lib/db/AGENTS.md` con contexto más detallado.
- **Serverless-first**: diseñado para Vercel + Neon. `vercel-build` ejecuta `init-db` tras el build.

## Commands
```bash
npm install
npm run dev           # localhost:3000
npm run build         # build de producción
npm run start         # servidor de producción
npm run lint          # eslint
npm run init-db       # seed: admin + restaurantes de ejemplo (tsx)
npm run vercel-build  # build + seed (usado en Vercel)
```

## Notes
- `src/app/page.tsx` redirige `/` → `/admin`.
- `scripts/init-db.ts` crea el usuario `admin@restaurant.local` / `admin123` y dos restaurantes de ejemplo. No usar en producción.
- No hay tests automatizados ni CI/CD configurados.
- Las páginas públicas son `/{restaurantSlug}` y `/{restaurantSlug}/menu/{menuNumber}`.
- Los archivos legacy `src/proxy.ts`, `src/lib/supabase/`, `database/setup.sql` y `restaurant.db*` fueron eliminados en la migración a Neon PostgreSQL.
- No existe `src/middleware.ts`. Para habilitar protección global de rutas, crear uno nuevo.
