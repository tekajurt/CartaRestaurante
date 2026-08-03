# Plan v1 — CMS generador de páginas de menú

## 1. Objetivo

Transformar la aplicación actual de un único menú de restaurante en un **CMS generador de páginas de menú**. Un usuario admin podrá crear restaurantes (clientes externos), cada uno con múltiples menús numerados, y cada restaurante dispondrá de:

- Una **página de presentación simple**: `/[restaurantSlug]`
- Una **página de menú funcional**: `/[restaurantSlug]/menu/[menuNumber]`

En v1 se prioriza la funcionalidad pura: creación de restaurantes, menús, platos, y visualización pública con plantillas. No se incluyen imágenes, registro de usuarios, dominios personalizados ni deployment.

---

## 2. Modelo de datos SQLite

### Tablas

```sql
restaurants(
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL DEFAULT 'default',
  accent_color TEXT DEFAULT '#f59e0b',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

menus(
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  menu_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  UNIQUE(restaurant_id, menu_number)
)

menu_items(
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Notas

- `slug` del restaurante se genera automáticamente desde el nombre (normalizado: minúsculas, sin espacios, guiones).
- `menu_number` es un entero secuencial por restaurante (`1`, `2`, `3`), para que la URL sea simple y predecible.
- `theme` guarda el slug del tema seleccionado.
- `accent_color` permite personalizar el color principal del tema sin agregar complejidad.

---

## 3. Rutas

### Panel de administración

| Ruta | Función |
|------|---------|
| `/admin` | Dashboard con listado de restaurantes. |
| `/admin/restaurants/new` | Formulario para crear restaurante. |
| `/admin/restaurants/[id]/edit` | Editar restaurante: nombre, descripción, tema, color. |
| `/admin/restaurants/[id]/menus` | Listar menús del restaurante. |
| `/admin/restaurants/[id]/menus/new` | Crear nuevo menú. |
| `/admin/restaurants/[id]/menus/[menuNumber]` | CRUD de platos del menú. |

### Público

| Ruta | Función |
|------|---------|
| `/[restaurantSlug]` | Página de presentación simple del restaurante. |
| `/[restaurantSlug]/menu/[menuNumber]` | Página del menú específico, renderizado con el tema seleccionado. |

---

## 4. Sistema de plantillas

### Estructura

```
src/themes/
├── default/
│   ├── LandingPage.tsx
│   ├── MenuPage.tsx
│   └── config.ts
├── modern/
│   ├── LandingPage.tsx
│   ├── MenuPage.tsx
│   └── config.ts
└── index.ts
```

### Reglas

- `index.ts` registra explícitamente los temas disponibles.
- Cada tema exporta `LandingPage`, `MenuPage` y `config` (nombre, descripción, color base por defecto).
- Los componentes reciben props tipadas:
  - `LandingPage`: `{ restaurant }`
  - `MenuPage`: `{ restaurant, menu, menuItems }`
- El tema se selecciona en el formulario de edición del restaurante.
- Para v1 se crean 2 temas: `default` y `modern`.

### Futuro v2

- Añadir más temas sin modificar la lógica de selección.
- Permitir configuración por tema (colores, tipografías, layout).
- Editor visual tipo bloques (WordPress-like).

---

## 5. Server Actions

### Restaurantes

- `createRestaurant(formData)`
- `updateRestaurant(id, formData)`
- `deleteRestaurant(id)`
- `getRestaurantBySlug(slug)`
- `getRestaurants()`

### Menús

- `createMenu(restaurantId, formData)`
- `updateMenu(restaurantId, menuNumber, formData)`
- `deleteMenu(restaurantId, menuNumber)`
- `getMenusByRestaurant(restaurantId)`
- `getMenuByNumber(restaurantId, menuNumber)`

### Platos

- `addMenuItem(menuId, formData)`
- `updateMenuItem(id, formData)`
- `deleteMenuItem(id)`
- `toggleMenuItemAvailability(id)`
- `getMenuItemsByMenu(menuId)`

### Reglas de seguridad

- Todas las Server Actions de admin deben verificar sesión con `getSessionUser()`.
- Validar entradas con Zod.
- Evitar depender de hidden inputs sin revalidación server-side.
- Deshabilitar el registro público (`signup`) en `login/actions.ts`.

---

## 6. UI del panel admin

### Dashboard `/admin`

- Listado de restaurantes.
- Botones: editar, ver menús, ver página pública.
- Botón para crear nuevo restaurante.

### Formulario de restaurante

- Nombre.
- Descripción.
- Selector de tema.
- Color de acento.

### Lista de menús

- Número + nombre del menú.
- Botones: editar platos, eliminar.
- Botón para crear nuevo menú.

### Editor de menú

- Formulario para añadir platos.
- Lista de platos agrupados por categoría.
- Botones: editar, eliminar, cambiar disponibilidad.

---

## 7. Páginas públicas

### Landing page `/[restaurantSlug]`

- Nombre del restaurante.
- Descripción breve.
- Botón/enlace para ver el menú 1: `/[restaurantSlug]/menu/1`.
- Diseño simple, limpio, sin sobrecargar.

### Página de menú `/[restaurantSlug]/menu/[menuNumber]`

- Nombre del restaurante.
- Título del menú.
- Platos agrupados por categoría.
- Mostrar solo platos `available = true` al público.
- Precios formateados.
- Diseño según el tema seleccionado.

---

## 8. Seguridad y validaciones

- Deshabilitar `signup` en `login/actions.ts`.
- Re-autorizar todas las Server Actions de admin con `getSessionUser()`.
- Validar con Zod:
  - `name`: string, min 2, max 100.
  - `description`: string, max 500.
  - `price`: number >= 0.
  - `category`: string, min 1.
  - `slug`: alfanumérico + guiones, único.
- No exponer `password_hash` ni datos internos.
- Asegurar que las operaciones de un menú/plato solo modifiquen recursos del restaurante correcto.

---

## 9. Datos de prueba

Actualizar `scripts/init-db.ts` para crear:

- 1 usuario admin.
- 2 restaurantes de ejemplo.
- 2 menús por restaurante.
- Platos de ejemplo en cada menú.

---

## 10. Pasos de implementación

| # | Tarea |
|---|-------|
| 1 | Actualizar schema SQLite a `restaurants`, `menus`, `menu_items`. |
| 2 | Crear `src/lib/db/restaurant.ts`, `src/lib/db/menu.ts`, `src/lib/db/menuItem.ts`. |
| 3 | Crear 2 temas en `src/themes/` con `LandingPage`, `MenuPage`, `config.ts`. |
| 4 | Crear Server Actions para restaurantes. |
| 5 | Crear Server Actions para menús. |
| 6 | Crear Server Actions para platos. |
| 7 | Construir dashboard `/admin` y listado de restaurantes. |
| 8 | Construir formularios de creación/edición de restaurante. |
| 9 | Construir listado de menús por restaurante. |
| 10 | Construir editor de platos por menú. |
| 11 | Construir landing page `/[restaurantSlug]`. |
| 12 | Construir página de menú `/[restaurantSlug]/menu/[menuNumber]`. |
| 13 | Actualizar `init-db.ts` con datos de prueba. |
| 14 | Deshabilitar registro público y reforzar login. |
| 15 | Ejecutar `npm run build` y corregir errores de tipo. |
| 16 | Actualizar `MIGRATION.md` y `README.md` con la nueva arquitectura. |

---

## 11. Skills a usar

| Skill | Rol |
|-------|-----|
| `react-expert` | App Router, rutas dinámicas, Server Actions. |
| `frontend-design` | Temas de menú y panel admin. |
| `security-best-practices` | Tenant isolation, validación, auth. |
| `javascript-pro` | TypeScript, Zod, patterns. |
| `vercel-react-best-practices` | Data fetching y rendering. |
| `ponytail` | Mantener la v1 minimal y no adelantar v2. |

---

## 12. Fuera de alcance de v1

- Registro de usuarios público.
- Imágenes, logos, fotos de platos.
- Dominios personalizados.
- Deployment / CI/CD.
- Tests extensivos.
- Optimizaciones avanzadas de caching.
- Editor visual tipo WordPress.

---

## 13. Futuro v2

- Imágenes de restaurantes y platos.
- Editor de bloques tipo WordPress.
- Más plantillas.
- Custom domains.
- Multi-usuario con roles.
- Deployment y CI/CD.
