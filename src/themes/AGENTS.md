# AGENTS.md — src/themes

## Overview
Sistema de plantillas extensible. Cada tema es un directorio auto-contenido que exporta config + componentes de página. El registro (`index.ts`) mapea slugs a temas; añadir uno nuevo requiere solo crear el directorio y registrarlo.

## Structure
```
src/themes/
├── index.ts          # Theme registry + getTheme() + themeList
├── default/          # "Clásico" — amber, cards blancas, diseño limpio
│   ├── config.ts     # { slug, name, description, defaultColor }
│   ├── LandingPage.tsx
│   └── MenuPage.tsx
└── modern/           # "Moderno" — dark bg, tipografía grande, green
    ├── config.ts
    ├── LandingPage.tsx
    └── MenuPage.tsx
```

## Where to Look

| Task | Location |
|------|----------|
| Registrar/obtener temas | `index.ts` → `themes` record, `getTheme(slug)`, `themeList` |
| Contrato de tema | `index.ts` → `ThemeConfig` + `ThemeComponents` |
| Añadir tema nuevo | Crear `src/themes/{slug}/` con `config.ts` + `LandingPage.tsx` + `MenuPage.tsx`, registrar en `index.ts` |

## Theme Contract

Cada tema exporta:

```ts
// config.ts
export const config: ThemeConfig = { slug, name, description, defaultColor };

// LandingPage.tsx
export default function LandingPage({ restaurant }: { restaurant: Restaurant }): ReactElement;

// MenuPage.tsx
export default function MenuPage({ restaurant, menu, menuItems }: {
  restaurant: Restaurant;
  menu: Menu;
  menuItems: MenuItem[];
}): ReactElement;
```

## How to Add a Theme

1. `mkdir src/themes/{slug}`
2. Crear `config.ts`, `LandingPage.tsx`, `MenuPage.tsx`
3. Registrar en `src/themes/index.ts`:
   ```ts
   import { config as {slug}Config } from "./{slug}/config";
   import {slug}Landing from "./{slug}/LandingPage";
   import {slug}Menu from "./{slug}/MenuPage";
   // Añadir al record `themes`
   ```

## Conventions

- **Tema dueño de la página completa.** Cada componente renderiza desde `<div className="min-h-screen">`. Sin layout wrapper compartido.
- **Server Components.** Ningún tema usa `"use client"`.
- **Tailwind v4 puro.** Sin CSS por tema. Variables globales en `globals.css` (`@theme inline`).
- **Color de acento vía prop.** `restaurant.accent_color` opcional, fallback a `config.defaultColor`.
- **Grupo por categoría inline.** Ambos temas replican `reduce` para agrupar items. Extraer a helper si se añade un 3er tema.
- **`themeList` solo expone config.** Sin referencias a componentes, serializable para admin UI.

## Anti-Patterns

- **`menu/1` hardcoded.** `LandingPage.tsx` en ambos temas asume `href={/${slug}/menu/1}`. Debe consultar qué menús existen.
- **Agrupación duplicada.** El `reduce` por categoría está copiado entre `default/MenuPage.tsx` y `modern/MenuPage.tsx`. Extraer a util compartida.
- **Sin validación de precio en UI.** `Number(item.price).toFixed(2)` muestra `NaN`/`Infinity` si el precio es inválido.

## Notes

- `getTheme(slug)` hace fallback a `"default"` si el slug no existe.
- La DB guarda `restaurant.theme` como string (slug del tema).
- Los temas son Server Components; no pueden usar hooks ni estado.
