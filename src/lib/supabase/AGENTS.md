# AGENTS.md — src/lib/supabase

## Overview
Restos de la migración Supabase → SQLite. Estos archivos actúan como shim de compatibilidad para que el código anterior que llamaba a `createClient()` de Supabase siga funcionando, pero ahora delega a la sesión JWT propia.

## Structure
```
src/lib/supabase/
├── server.ts      # createClient() que devuelve { auth: { getUser, signOut } }
└── middleware.ts  # updateSession(request) con lógica de protección
```

## Where to Look
| Task | Location |
|------|----------|
| Cliente shim | `server.ts` |
| Helper de protección de rutas (no registrado) | `middleware.ts` |

## Conventions
- `server.ts` devuelve un objeto compatible con la API de Supabase Auth: `getUser()` y `signOut()`.
- `middleware.ts` exporta `updateSession(request: NextRequest)` que redirige `/admin` si no hay sesión y `/login` si la hay.
- **No es un middleware de Next.js registrado**. Next.js requiere `src/middleware.ts` o `middleware.ts` en la raíz; aquí solo existe `src/proxy.ts` que tampoco está registrado.

## Anti-Patterns
- **Middleware no conectado**. La protección real ocurre solo en `src/app/admin/page.tsx` con `getSessionUser()`.
- **Uso de `cookies()` en middleware**. `middleware.ts` importa `getSessionUser()` que usa `cookies()` de `next/headers`; en Edge middleware se debe usar `request.cookies` de `NextRequest`.
- **Semántica de error diferente**. `server.ts` siempre devuelve `error: null`, aunque no haya usuario autenticado.

## Notes
- Considera eliminar esta carpeta y renombrar `src/proxy.ts` a `src/middleware.ts` si quieres protección global de rutas.
- Si mantienes el shim, documenta que es legacy y no re-introduzcas dependencias de Supabase.
