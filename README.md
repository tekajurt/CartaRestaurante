# CMS Generador de Menús de Restaurante

Aplicación para generar páginas de menú de restaurante. Cada restaurante (cliente externo) tiene una landing page simple y uno o más menús numerados accesibles públicamente.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- SQLite (`better-sqlite3`)
- Autenticación JWT propia en cookies HTTP-only

## Características

- Panel de administración para crear y gestionar restaurantes.
- Múltiples menús por restaurante (`/restaurantSlug/menu/1`, `/menu/2`, etc.).
- Sistema de plantillas extensible en `src/themes/`.
- Edición de platos por categoría, precio y disponibilidad.
- Vista pública de cada menú renderizada con el tema seleccionado.
- Sin registro público: un único admin gestiona todo.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Configuración

```bash
# Crear base de datos y usuario de prueba
npm run init-db
```

Credenciales de prueba:

- Email: `admin@restaurant.local`
- Contraseña: `admin123`

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige al panel de administración.

## URLs de ejemplo

- `/admin` — panel de administración
- `/admin/restaurants/new` — crear restaurante
- `/la-trattoria` — página de presentación
- `/la-trattoria/menu/1` — menú público

## Build de producción

```bash
npm run build
npm start
```

## Estructura

```
src/
├── app/
│   ├── page.tsx                    # Redirige a /admin
│   ├── login/                      # Login
│   ├── admin/                      # Dashboard
│   ├── admin/restaurants/          # CRUD restaurantes
│   ├── admin/restaurants/[id]/menus/           # CRUD menús
│   ├── admin/restaurants/[id]/menus/[menuNumber]/  # CRUD platos
│   └── [restaurantSlug]/           # Landing + menú público
├── lib/
│   ├── db/                         # SQLite, auth, sesiones
│   └── jwt.ts                      # JWT manual
├── themes/                         # Plantillas de menú
└── types/                          # Tipos compartidos
```

## Seguridad

- `JWT_SECRET` debe configurarse en producción.
- El registro de usuarios está deshabilitado en v1.
- Las Server Actions de admin requieren autenticación.
- `restaurant.db` y sus archivos WAL/SHM no se versionan.

## Notas

- `database/setup.sql` es legacy de Supabase y no se utiliza.
- No hay imágenes/logos en v1; se agregarán en v2.
- El sistema de plantillas es extensible: añade nuevos temas en `src/themes/`.

## Comandos

```bash
npm run dev        # Desarrollo
npm run build      # Build
npm run start      # Producción
npm run lint       # Linting
npm run init-db    # Seed inicial
```

## Migración

Ver `MIGRATION.md` para el historial de cambios desde Supabase.
