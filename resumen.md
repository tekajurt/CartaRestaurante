# Resumen de Trabajo — CartaRestaurante

## 1. Objetivo
Generar la base de conocimiento `AGENTS.md`, ejecutar `npm audit`, planificar la transformación del proyecto a un **CMS generador de páginas de menú** e implementar la funcionalidad v1.

---

## 2. AGENTS.md generados

Se analizó el proyecto con explore agents y se generaron los siguientes archivos de conocimiento para agentes:

| Archivo | Ubicación | Razón / Score |
|---------|-----------|---------------|
| Root | `./AGENTS.md` | Siempre se genera. Cubre stack, estructura, mapa de código, convenciones, anti-patterns y comandos. |
| `src/app` | `src/app/AGENTS.md` | Alto: contiene rutas, Server Actions, UI y lógica de protección de admin. |
| `src/lib/db` | `src/lib/db/AGENTS.md` | Alto: capa de persistencia, auth, hashing, sesiones JWT y SQLite. |
| `src/lib/supabase` | `src/lib/supabase/AGENTS.md` | Medio: shim de compatibilidad legacy y middleware no registrado. |

Los archivos de menor complejidad (`src/components/ui`, `src/types`, `scripts/`, `database/`) quedaron cubiertos por el root o por sus padres directos.

---

## 3. Resultado de `npm audit`

**Resumen:** 9 vulnerabilidades (2 low, 7 high).

| Paquete | Severidad | Tipo de riesgo principal | Fix disponible |
|---------|-----------|--------------------------|----------------|
| `next` | **high** | Varios: DoS, SSRF, XSS, bypass de middleware/proxy, cache poisoning, CSRF | `npm audit fix` |
| `postcss` | **high** | XSS, path traversal, file disclosure | `npm audit fix` |
| `sharp` | **high** | Vulnerabilidades heredadas de libvips | `npm audit fix` |
| `brace-expansion` | **high** | DoS / memory exhaustion / OOM | `npm audit fix` |
| `picomatch` | **high** | ReDoS, method injection | `npm audit fix` |
| `js-yaml` | **high** | Quadratic DoS | `npm audit fix` |
| `flatted` | **high** | Prototype pollution, unbounded recursion DoS | `npm audit fix` |
| `esbuild` | low | Arbitrary file read (Windows) | `npm audit fix` |
| `@babel/core` | low | Arbitrary file read via sourceMappingURL | `npm audit fix` |

**Acción recomendada inmediata:**
```bash
npm audit fix
# o si hay conflictos:
npm audit fix --force
```

La versión actual de `next` es `^16.1.6`. La mayoría de los advisories de `next` se corrigen subiendo a `>=16.2.11` (o a la última estable disponible). Revisa el changelog antes de aplicar `--force`.

---

## 4. Hallazgos de seguridad del código

Hallazgos más críticos detectados durante el análisis del código fuente.

### 4.1 Críticos / Alto

1. **JWT con fallback hardcodeado** (`src/lib/jwt.ts`)
   - `const SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";`
   - Si la variable de entorno no está seteada, cualquiera puede forjar tokens de sesión.

2. **Hash de contraseñas con sal fija** (`src/lib/db/auth.ts`)
   - `crypto.pbkdf2Sync(password, "salt", 1000, 64, "sha512")`
   - Sal global para todos los usuarios; 1000 iteraciones es muy bajo para estándares actuales (OWASP recomienda ≥600k para PBKDF2-HMAC-SHA512).

3. **Server Actions de admin no re-autorizan** (`src/app/admin/actions.ts`)
   - `getMenuItems`, `addMenuItem`, `updateMenuItem`, `deleteMenuItem`, `toggleAvailability` no llaman `getSessionUser()`.
   - Un cliente no autenticado puede invocar estas acciones directamente.

4. **Middleware de protección no registrado**
   - `src/lib/supabase/middleware.ts` y `src/proxy.ts` existen, pero no hay `src/middleware.ts` ni `middleware.ts` en la raíz.
   - La protección de `/admin` depende solo de `src/app/admin/page.tsx`, lo cual no cubre Server Actions.

5. **Registro abierto de usuarios** (`src/app/login/actions.ts`)
   - `signup` permite crear cuentas sin invitación, rate limiting ni roles.
   - Cualquier visitante puede registrarse y acceder a `/admin`.

6. **Credenciales de prueba documentadas / hardcodeadas**
   - `scripts/init-db.ts` crea `admin@restaurant.local` / `admin123`.
   - `database/setup.sql` contiene `admin@admin` / `asdasdasd`.
   - `MIGRATION.md` documenta las credenciales de prueba.

7. **JWT implementado a mano** (`src/lib/jwt.ts`)
   - No valida `alg`, `iss`, `aud`, `nbf`, etc. Riesgo de extensión futura con algoritmo confusion.
   - Recomendado: usar `jose` en producción.

8. **Base de datos en la raíz y posiblemente trackeada**
   - `restaurant.db`, `restaurant.db-shm`, `restaurant.db-wal` están en la raíz.
   - `.gitignore` actual no los excluye; podrían filtrarse hashes y datos al repositorio.

### 4.2 Medio / Bajo

9. **Sin validación de entradas en Server Actions**
   - FormData se castea directamente a `string` / `number`. `price` puede ser `NaN`.

10. **Hidden inputs confiables**
    - `id` y `available` se envían como `<input type="hidden">`; un cliente puede modificarlos para editar/eliminar otros platos.

11. **Cookie de sesión**
    - `sameSite: "lax"` es aceptable; `"strict"` es más seguro para un panel admin.
    - `secure` solo en producción; cuidado si se despliega detrás de proxy que no setea `NODE_ENV`.

12. **SQL dinámico en `updateMenuItem`** (`src/lib/db/menu.ts`)
    - Construye `SET col = ?` en runtime; aunque usa parámetros, es frágil y peligroso si se extiende a claves controlables por usuario.

13. **Navegación interna con `<a>`**
    - `src/app/admin/page.tsx` y `src/app/login/page.tsx` usan anchors en lugar de `<Link>` de Next.js.

14. **README desactualizado**
    - Sigue describiendo Supabase, variables de entorno y un `src/middleware.ts` que ya no existen.

15. **Sin rate limiting**
    - Login y signup son susceptibles a fuerza bruta y flooding.

16. **Sin headers de seguridad**
    - `next.config.ts` está vacío; no hay CSP, HSTS, X-Frame-Options, etc.

17. **Sin tests automatizados**
    - No hay tests unitarios ni de integración; no hay CI/CD.

---

## 5. Recomendaciones priorizadas

### Seguridad (alta prioridad)
1. **Obligar `JWT_SECRET` por entorno** y eliminar el fallback hardcodeado.
2. **Reemplazar el JWT manual** por `jose` u otra librería probada.
3. **Cambiar el hashing de passwords** a bcrypt/Argon2 con sal aleatoria por usuario.
4. **Re-autorizar todas las Server Actions de admin** llamando `getSessionUser()` al inicio.
5. **Crear `src/middleware.ts`** real que proteja `/admin` y redirija `/login` si ya hay sesión.
6. **Eliminar o proteger el registro público**: requerir invitación, rol inicial o deshabilitar `signup` en producción.
7. **Agregar `restaurant.db*` al `.gitignore`** y no versionar nunca la base de datos.
8. **No usar credenciales de prueba** en producción; documentar que son solo para desarrollo local.

### Calidad y robustez (media prioridad)
9. **Validar todas las entradas** de Server Actions con Zod (email, password, campos de plato, precios).
10. **No confiar en hidden inputs**: revalidar `id` y `available` server-side; confirmar que el plato existe antes de modificarlo.
11. **Usar `<Link>` de Next.js** para navegación interna.
12. **Actualizar `README.md`** para reflejar la arquitectura SQLite actual.
13. **Agregar tests** básicos para auth y CRUD.
14. **Configurar headers de seguridad** en `next.config.ts`.
15. **Agregar rate limiting** en login/signup.

### Dependencias (alta prioridad)
16. **Ejecutar `npm audit fix`** y subir `next` a una versión que corrija los advisories.

---

## 5. Implementación CMS v1 completada

Se transformó la aplicación de un único menú a un CMS generador de páginas de menú.

### Modelo de datos
- Nuevas tablas: `restaurants`, `menus`, `menu_items`.
- Relación: un restaurante tiene muchos menús; un menú tiene muchos platos.
- `menu_number` secuencial por restaurante para URLs simples (`/slug/menu/1`).

### Funcionalidades implementadas
- Dashboard `/admin` con listado de restaurantes.
- CRUD de restaurantes: crear, editar, eliminar, elegir tema y color.
- CRUD de menús por restaurante.
- CRUD de platos por menú, agrupados por categoría, con toggle de disponibilidad.
- Página pública `/[restaurantSlug]` (landing simple).
- Página pública `/[restaurantSlug]/menu/[menuNumber]` (menú renderizado con plantilla).
- Sistema de plantillas extensible con 2 temas: `default` y `modern`.
- Registro de usuarios deshabilitado; solo el admin seed puede acceder.
- Todas las Server Actions de admin re-autorizan con `requireAuth()`.
- Validación de entradas con Zod.

### Archivos y carpetas nuevas
- `src/lib/db/restaurant.ts`, `menu.ts`, `menuItem.ts`
- `src/app/admin/restaurants/actions.ts`
- `src/app/admin/restaurants/new/page.tsx`
- `src/app/admin/restaurants/[id]/edit/page.tsx`
- `src/app/admin/restaurants/[id]/menus/actions.ts`
- `src/app/admin/restaurants/[id]/menus/page.tsx`
- `src/app/admin/restaurants/[id]/menus/[menuNumber]/actions.ts`
- `src/app/admin/restaurants/[id]/menus/[menuNumber]/page.tsx`
- `src/app/admin/restaurants/[id]/menus/[menuNumber]/MenuItemModal.tsx`
- `src/app/[restaurantSlug]/page.tsx`
- `src/app/[restaurantSlug]/menu/[menuNumber]/page.tsx`
- `src/themes/default/`, `src/themes/modern/`, `src/themes/index.ts`
- `src/types/restaurant.ts`, `src/types/menu.ts`, `src/types/menuItem.ts`, `src/types/index.ts`

### Validación
- `npm run lint` pasa sin errores.
- `npm run build` finaliza correctamente.
- `npm run init-db` crea usuario, restaurantes, menús y platos de ejemplo.

---

## 6. npm audit fix aplicado

Se ejecutó `npm audit fix` sin `--force` y se completaron las correcciones pendientes con **overrides manuales** en `package.json`.

### Resultado

- Estado inicial: 9 vulnerabilidades (2 low, 7 high).
- Después de `npm audit fix` (sin `--force`): quedaron 19 advisories agrupados en `next/postcss/sharp`, `esbuild` y el árbol de `eslint/minimatch/brace-expansion`.
- Después de aplicar overrides: **0 vulnerabilidades**.

### Overrides añadidos

```json
"overrides": {
  "postcss": "^8.5.18",
  "sharp": "^0.35.0",
  "esbuild": "^0.28.1",
  "minimatch": "^10.0.3",
  "brace-expansion": "^5.0.8"
}
```

También se actualizó `next` de `^16.1.6` a `^16.2.12` (resuelto automáticamente por el fix).

### Verificación

- `npm run lint` ✅ sin errores.
- `npm run build` ✅ exitoso.
- `npm audit` ✅ 0 vulnerabilidades.

### Nota

Los overrides fueron necesarios porque `npm audit fix --force` proponía cambios destructivos (bajar `next` a `9.3.3` o subir `eslint` a `10.8.0`). Los overrides forzaron versiones parcheadas compatibles sin romper el árbol de dependencias.

---

## 7. Archivos clave modificados / creados

- `AGENTS.md` (actualizado con arquitectura CMS)
- `src/app/AGENTS.md`
- `src/lib/db/AGENTS.md`
- `src/lib/supabase/AGENTS.md`
- `.gitignore` (añadido `restaurant.db*`)
- `src/lib/db/init.ts`
- `src/lib/db/session.ts`
- `src/lib/db/auth.ts`
- `src/lib/jwt.ts`
- `src/app/page.tsx`
- `src/app/login/actions.ts`
- `src/app/login/page.tsx`
- `src/app/admin/page.tsx`
- `scripts/init-db.ts`
- `README.md`
- `MIGRATION.md`
- `resumen.md` (este archivo)
- Nuevos archivos del CMS listados en la sección 5.

---

## 8. Notas finales

- La funcionalidad v1 del CMS está completa: crear restaurantes, menús, platos y generar páginas públicas con plantillas.
- **Vulnerabilidades de dependencias corregidas**: `npm audit` reporta 0 issues tras `npm audit fix` + overrides manuales.
- El proyecto **sigue teniendo riesgos de seguridad internos** que requieren atención antes de producción: JWT manual, sal fija en PBKDF2, falta de rate limiting y headers de seguridad.
- `README.md` y `MIGRATION.md` reflejan ahora la arquitectura actual.
- Recomendación para v1.1: migrar a `jose` para JWT y bcrypt/Argon2 para passwords; agregar rate limiting y headers de seguridad.
