# AGENTS.md — src/app

## Overview
Rutas y páginas del CMS generador de menús. Incluye login, dashboard de admin, CRUD de restaurantes/menús/platos y las páginas públicas de cada restaurante.

## Structure
```
src/app/
├── page.tsx              # Redirección / → /admin
├── layout.tsx            # Root layout + Geist fonts + globals.css
├── globals.css           # Tailwind v4 + theme
├── login/
│   ├── page.tsx          # Formulario login
│   └── actions.ts        # login, signup (deshabilitado), signOut
├── admin/
│   ├── page.tsx          # Dashboard con listado de restaurantes
│   └── restaurants/
│       ├── new/page.tsx              # Crear restaurante
│       ├── [id]/edit/page.tsx        # Editar restaurante
│       ├── [id]/menus/page.tsx       # Listar menús
│       └── [id]/menus/[menuNumber]/
│           ├── page.tsx              # Editor de platos
│           └── MenuItemModal.tsx     # Modal cliente para platos
└── [restaurantSlug]/
    ├── page.tsx                      # Landing page del restaurante
    └── menu/[menuNumber]/page.tsx    # Menú público
```

## Where to Look
| Task | Location |
|------|----------|
| Protección de admin | `admin/page.tsx` (revisa `getSessionUser()`) |
| Acciones de autenticación | `login/actions.ts` |
| Acciones CRUD de restaurantes | `admin/restaurants/actions.ts` |
| Acciones CRUD de menús | `admin/restaurants/[id]/menus/actions.ts` |
| Acciones CRUD de platos | `admin/restaurants/[id]/menus/[menuNumber]/actions.ts` |
| Componentes reutilizables | `src/components/ui/` |
| Páginas públicas | `[restaurantSlug]/`, `[restaurantSlug]/menu/[menuNumber]/` |

## Conventions
- Páginas son **Server Components** por defecto.
- Componentes interactivos llevan `"use client"` (modal, botón de carga).
- Los formularios usan `formAction` de Server Actions.
- Las rutas dinámicas usan parámetros async de Next.js 15+.
- `ActionButton` reemplaza a `<button type="submit">` para mostrar estado de `useFormStatus`.
- `Link` de Next.js se usa para navegación interna.

## Anti-Patterns
- **Server Actions deben re-autorizar**. Todas las acciones de admin llaman `requireAuth()`.
- **No confiar hidden inputs sin revalidación**. Los IDs se envían ocultos y se validan en el servidor.
- **Sin middleware global**. La protección está página por página y acción por acción.

## Notes
- `admin/page.tsx` muestra restaurantes como tarjetas con acciones rápidas.
- El editor de platos agrupa por categoría y permite cambiar disponibilidad inline.
- Las páginas públicas seleccionan el tema desde `src/themes/index.ts`.
