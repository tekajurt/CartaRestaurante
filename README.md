# temp-carta — CMS Generador de Menús de Restaurante

**Generated:** 2026-08-05 01:10 UTC
**Commit:** `12fca9a`
**Branch:** `dev`

Aplicación para generar páginas de menú de restaurante. Cada restaurante (cliente externo) tiene una landing page y uno o más menús numerados accesibles públicamente vía slug. Un único admin gestiona todo desde `/admin`.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict)
- Tailwind CSS v4
- Neon PostgreSQL (`@neondatabase/serverless`)
- Zod v4
- JWT manual (HS256) en cookie HTTP-only
- Sin ORM (SQL tagged templates)

## Structure

```
├── scripts/init-db.ts              # Seeder (admin + restaurantes demo)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # / → redirect /admin
│   │   ├── layout.tsx              # Root layout + Geist fonts
│   │   ├── globals.css             # Tailwind v4 @theme inline
│   │   ├── login/                  # Login form + acciones auth
│   │   ├── admin/                  # Dashboard protegido
│   │   │   └── restaurants/        # CRUD restaurantes/menús/platos
│   │   └── [restaurantSlug]/       # Páginas públicas (landing + menú)
│   ├── components/ui/              # Modal + ActionButton (use client)
│   ├── lib/
│   │   ├── jwt.ts                  # JWT encode/decode manual
│   │   └── db/                     # Persistencia Neon + auth + session
│   ├── themes/                     # Sistema de plantillas extensible
│   └── types/                      # Tipos compartidos
```

## Where to Look

| Task | Location |
|------|----------|
| Auth (login/session) | `src/app/login/actions.ts`, `src/lib/db/{auth,session}.ts` |
| Restaurant CRUD | `src/app/admin/restaurants/actions.ts`, `src/lib/db/restaurant.ts` |
| Menu CRUD | `src/app/admin/restaurants/[id]/menus/actions.ts`, `src/lib/db/menu.ts` |
| Menu item CRUD | `src/app/admin/restaurants/[id]/menus/[menuNumber]/actions.ts`, `src/lib/db/menuItem.ts` |
| Theme system | `src/themes/index.ts` (registry), `src/themes/{theme}/` (implementations) |
| DB schema | `src/lib/db/init.ts` |
| Reusable UI | `src/components/ui/ActionButton.tsx`, `Modal.tsx` |
| Types | `src/types/` |
| Seed data | `scripts/init-db.ts` |
| Public pages | `src/app/[restaurantSlug]/page.tsx`, `menu/[menuNumber]/page.tsx` |

## Code Map

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `getSQL` | singleton | `src/lib/db/init.ts:6` | Conexión Neon + init schema |
| `requireAuth` | guard | `src/lib/db/session.ts:60` | Auth requerido en Server Actions |
| `getSessionUser` | guard | `src/lib/db/session.ts:34` | Auth para Server Components |
| `mapRow` | helper | `src/lib/db/*.ts` | Cast DB rows → domain types |
| `generateUniqueSlug` | helper | `src/lib/db/restaurant.ts:16` | Slug generation con dedup |
| `getTheme` | resolver | `src/themes/index.ts:30` | Theme lookup con fallback a default |
| `ActionButton` | component | `src/components/ui/ActionButton.tsx` | Submit button con useFormStatus |
| `Modal` | component | `src/components/ui/Modal.tsx` | Modal genérico con Escape |
| `MenuItemModal` | component | `src/app/admin/.../MenuItemModal.tsx` | Modal create/edit plato |
| `jwtEncode`/`jwtDecode` | util | `src/lib/jwt.ts` | JWT manual HS256 |

## Conventions

- **Server Components por defecto.** Solo `"use client"` en `ActionButton`, `Modal`, `MenuItemModal`.
- **Server Actions con `formAction`.** Cada action tiene Zod + `revalidatePath` + `redirect` en error.
- **Auth página por página y acción por acción.** Sin `middleware.ts`. Cada admin page llama `getSessionUser()`, cada action llama `requireAuth()`.
- **Sin registro público.** `signup()` redirige con error. Solo el admin seedeado.
- **Types exclusivamente con `type`.** Cero `interface`. `import type` para type-only imports.
- **Nombres de archivo:** kebab-case para utilidades, PascalCase para componentes.
- **Server Actions nombradas `{verb}{Entity}Action`** (ej: `createRestaurantAction`).
- **Tipos de input con sufijo `{Entity}Input`** (ej: `RestaurantInput`).
- **DB columns en snake_case.** TS properties mapean igual (sin camelCase mapping).
- **Zod co-locado con las acciones.** Sin capa de validación separada.
- **`@/` alias para imports.** Solo imports relativos entre siblings del mismo directorio.
- **Barrel `src/lib/db/index.ts` existe pero no se importa.** Preferir imports explícitos.

## Unique Styles

- **`ActionButton` wrapper.** Reemplaza `<button type="submit">`, muestra spinner con `useFormStatus()` y label alternativo en carga.
- **`mapRow` helpers locales.** Cada módulo DB tiene su propio `mapRow(row: Record<string, unknown>): T`.
- **Theme system como plugin registry.** `src/themes/index.ts` mapea slug → `{config, LandingPage, MenuPage}`. Añadir tema = nuevo directorio + registro.
- **Slug auto-generado.** `slugify` con normalización Unicode + contador de colisión.
- **`void _unusedVar`** para suprimir lint en destructuring parcial.

## Anti-Patterns (este proyecto)

- **`DROP TABLE IF EXISTS menu_items` en cada cold start** (`src/lib/db/init.ts:29`). Destruye todos los platos en cada arranque frío serverless.
- **Sal fija `"salt"` en PBKDF2** (`src/lib/db/auth.ts:12`). Debe ser aleatoria por usuario.
- **1000 iteraciones PBKDF2** (`src/lib/db/auth.ts:12`). Muy bajo (OWASP: >= 600k).
- **`pbkdf2Sync` bloquea event loop** (`src/lib/db/auth.ts:12`). Usar async en serverless.
- **JWT manual sin `jose`** (`src/lib/jwt.ts`). Riesgo de timing attacks.
- **`created_at` generado en cliente** (5 archivos en `src/lib/db/`). Usar `DEFAULT NOW()` en BD.
- **`.env` commiteado** con `DATABASE_URL` y `JWT_SECRET`.
- **Sin `layout.tsx` en admin.** 5 páginas copian el mismo shell nav+main manualmente.
- **Sin `loading.tsx`, `error.tsx`, `not-found.tsx`.** Cero estados de carga/error/404.
- **`menu/1` hardcoded** en landing pages. Asume que el menú 1 siempre existe.

## Commands

```bash
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build producción
npm run start        # Producción
npm run lint         # ESLint
npm run init-db      # Seed DB (admin + datos demo)
npm run vercel-build # Build + seed (usado por Vercel)
```

## URLs

- `/admin` — Dashboard
- `/admin/restaurants/new` — Crear restaurante
- `/admin/restaurants/[id]/edit` — Editar
- `/admin/restaurants/[id]/menus` — Lista de menús
- `/admin/restaurants/[id]/menus/[num]` — Editor de platos
- `/[slug]` — Landing pública
- `/[slug]/menu/[num]` — Menú público

## Instalación

```bash
npm install
npm run init-db
```

Credenciales demo: `admin@restaurant.local` / `admin123`

## Notas

- Sin imágenes/logos en v1.
- Sin tests. Sin CI.
- `signup()` deshabilitado: solo admin seedeado.
- El sistema de plantillas es extensible: añade temas en `src/themes/`.
- `JWT_SECRET` requerido; lanza error si no está definido.
- `MIGRATION.md` documenta el historial de cambios desde Supabase.
