# AGENTS.md — src/app

## Overview
Rutas y páginas del CMS. Login, dashboard admin, CRUD restaurantes/menús/platos, y páginas públicas con temas.

## Structure
```
src/app/
├── page.tsx              # / → redirect /admin
├── layout.tsx            # Root layout + Geist + globals.css
├── globals.css           # Tailwind v4 @theme inline
├── login/
│   ├── page.tsx          # Formulario login/signup
│   └── actions.ts        # login, signup (deshabilitado), signOut
├── admin/
│   ├── page.tsx          # Dashboard: lista restaurantes como cards
│   └── restaurants/
│       ├── actions.ts    # create/update/delete/get restaurants
│       ├── new/page.tsx
│       ├── [id]/edit/page.tsx
│       └── [id]/menus/
│           ├── actions.ts        # create/update/delete menus
│           ├── page.tsx          # Lista de menús del restaurante
│           └── [menuNumber]/
│               ├── actions.ts        # add/update/delete/toggle items
│               ├── page.tsx          # Editor de platos por categoría
│               └── MenuItemModal.tsx # Modal create/edit plato (client)
└── [restaurantSlug]/
    ├── page.tsx                      # Landing (theme via getTheme)
    └── menu/[menuNumber]/page.tsx    # Menú público (theme, solo available)
```

## Where to Look

| Task | Location |
|------|----------|
| Auth guard (page) | Cada admin page: `getSessionUser()` + `redirect("/login")` |
| Auth guard (action) | Cada Server Action: `requireAuth()` |
| Login/signOut | `login/actions.ts` |
| Restaurant CRUD | `admin/restaurants/actions.ts` |
| Menu CRUD | `admin/restaurants/[id]/menus/actions.ts` |
| Menu item CRUD | `admin/restaurants/[id]/menus/[menuNumber]/actions.ts` |
| Modal plato | `admin/restaurants/[id]/menus/[menuNumber]/MenuItemModal.tsx` |
| Public landing | `[restaurantSlug]/page.tsx` |
| Public menu | `[restaurantSlug]/menu/[menuNumber]/page.tsx` |

## Conventions

- Páginas son **Server Components** por defecto.
- `"use client"` solo en `MenuItemModal`. `ActionButton` y `Modal` (en `components/ui/`) también son client.
- Formularios usan `formAction` apuntando a Server Actions.
- `ActionButton` reemplaza `<button type="submit">` para mostrar `useFormStatus`.
- Cada acción usa Zod `.safeParse()` + `revalidatePath()` + `redirect` en error.
- IDs via hidden inputs, revalidados server-side.
- `params` son async (Next.js 15+).
- **Sin layout anidado en admin.** Cada página replica manualmente el shell `nav + main.bg-gray-100`.
- **Sin `loading.tsx`, `error.tsx`, `not-found.tsx`** en ningún nivel.

## Anti-Patterns

- **Auth debe re-ejecutarse en cada acción.** Toda Server Action empieza con `requireAuth()`.
- **Hidden inputs sin revalidación = confianza ciega.** Siempre validar en servidor.
- **Error via URL query params.** `redirect(...?error=...)` expone mensajes en URL y logs.
- **Metadata no actualizado.** `layout.tsx` tiene `"Create Next App"` scaffold sin limpiar.
- **`menu/1` hardcoded.** Landing pages asumen que el menú 1 existe (`LandingPage.tsx` en ambos temas).

## Notes

- Las páginas públicas obtienen el tema via `getTheme(restaurant.theme)` y renderizan su `LandingPage`/`MenuPage`.
- El editor de platos agrupa items por categoría con un `reduce` client-side.
- `MenuItemModal` funciona en modo create y edit (condicionado por prop `item` opcional).
- Sin CSRF explícito; los Server Actions de Next.js incluyen protección básica.
