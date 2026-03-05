# Migración de Supabase a SQLite3

Esta aplicación ha sido migrada de **Supabase** a **SQLite3** para usar un archivo como base de datos local.

## Cambios realizados

### 1. Dependencias

- ❌ Removidas: `@supabase/ssr`, `@supabase/supabase-js`, `sqlite3`
- ✅ Agregadas: `better-sqlite3`

### 2. Estructura de Base de Datos

- **Tablas creadas automáticamente**:
  - `users`: almacena usuarios y contraseñas (hasheadas)
  - `menu_items`: almacena los platos del menú

### 3. Autenticación

- **Sistema anterior**: OAuth con Supabase
- **Sistema nuevo**: Email + Contraseña con sesiones JWT almacenadas en cookies
- Las contraseñas se hashean con PBKDF2

### 4. Ubicación de la Base de Datos

El archivo `restaurant.db` se crea automáticamente en la raíz del proyecto.

## Cómo usar

### Instalación

```bash
npm install
```

### Inicialización de la Base de Datos

La base de datos se inicializa automáticamente en el primer acceso. Para crear un usuario de prueba:

```bash
npm run init-db
```

**Credenciales de prueba**:

- Email: `admin@restaurant.local`
- Contraseña: `admin123`

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Producción

```bash
npm run build
npm start
```

## Estructura de carpetas

```
src/
├── lib/
│   ├── db/
│   │   ├── init.ts      # Inicialización de BD y esquema
│   │   ├── menu.ts      # Operaciones CRUD para menú
│   │   ├── auth.ts      # Autenticación y usuarios
│   │   └── session.ts   # Manejo de sesiones
│   ├── jwt.ts           # Codificación/decodificación de JWT
│   └── supabase/
│       ├── server.ts    # Compatible pero usa SQLite3
│       └── middleware.ts # Protección de rutas
├── app/
│   ├── admin/           # Panel de administración
│   ├── login/           # Página de login
│   └── carta/           # Menú público
```

## Migraciones de código principales

### Antes (Supabase)

```typescript
const supabase = await createClient();
const { data, error } = await supabase.from("menu_items").select("*");
```

### Después (SQLite3)

```typescript
import { getMenuItems } from "@/lib/db/menu";
const items = getMenuItems();
```

### Antes (Login)

```typescript
const { error } = await supabase.auth.signInWithPassword(data);
```

### Después (Login)

```typescript
import { verifyUserPassword, createSession } from "@/lib/db/auth";
const user = verifyUserPassword(email, password);
if (user) await createSession(user);
```

## Variables de entorno

Opcional (se genera automáticamente si no existe):

- `JWT_SECRET`: Clave para firmar tokens JWT

## Seguridad

- ✅ Contraseñas hasheadas con PBKDF2
- ✅ Sesiones firmadas con JWT
- ✅ Cookies HTTP-only
- ✅ CSRF protection en routes dinámicas

## Restauración de datos desde Supabase

Si necesitas migrar datos existentes de Supabase, puedes:

1. Exportar los datos como JSON desde Supabase
2. Usar un script para importarlos a SQLite3

## Notas

- El archivo `restaurant.db` se crea automáticamente
- Recomendado hacer backup regularmente del archivo `restaurant.db`
- Para resetear la BD, simplemente elimina el archivo `restaurant.db` y reinicia la app
