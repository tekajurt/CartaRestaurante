# Gestor de Menú de Restaurante

Una aplicación completa para gestionar el menú de un restaurante con Next.js 15, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- ✅ **Autenticación** con Supabase Auth
- ✅ **Rutas protegidas** con middleware
- ✅ **Panel de administración** para gestionar el menú (CRUD completo)
- ✅ **Vista pública** de la carta accesible sin autenticación
- ✅ **TypeScript** para type safety
- ✅ **Tailwind CSS** para estilos modernos
- ✅ **Server Components** de Next.js 15
- ✅ **Server Actions** para operaciones de datos

## 📋 Requisitos previos

- Node.js 18+ instalado
- Una cuenta en [Supabase](https://supabase.com)

## 🛠️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a **Project Settings** → **API**
3. Copia el `Project URL` y la `anon/public` key
4. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

5. Edita `.env.local` y agrega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aquí
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
```

### 3. Configurar la base de datos

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el script de `database/setup.sql` para crear:
   - Tabla `menu_items`
   - Índices para optimizar consultas
   - Políticas de Row Level Security (RLS)
   - Datos de ejemplo (opcional)

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── admin/              # Panel de administración (protegido)
│   │   ├── actions.ts      # Server Actions para CRUD
│   │   └── page.tsx        # Interfaz de administración
│   ├── auth/
│   │   └── callback/       # Callback de autenticación de Supabase
│   │       └── route.ts
│   ├── carta/              # Vista pública del menú
│   │   └── page.tsx
│   ├── login/              # Página de login/registro
│   │   ├── actions.ts      # Server Actions de autenticación
│   │   └── page.tsx
│   └── page.tsx            # Home (redirige a /carta)
├── lib/
│   └── supabase/
│       ├── client.ts       # Cliente de Supabase para navegador
│       ├── server.ts       # Cliente de Supabase para servidor
│       └── middleware.ts   # Lógica de middleware
└── middleware.ts           # Middleware de Next.js
database/
└── setup.sql               # Script SQL para configurar DB
```

## 🔐 Rutas

- **`/`** - Home (redirige a `/carta`)
- **`/carta`** - Vista pública del menú (sin autenticación)
- **`/login`** - Login y registro
- **`/admin`** - Panel de administración (requiere autenticación)

## 🎯 Uso

### Para Administradores

1. Regístrate en `/login`
2. Confirma tu email (revisa tu bandeja de entrada)
3. Inicia sesión
4. Accede al panel de administración en `/admin`
5. Agrega, edita o elimina platos del menú
6. Cambia la disponibilidad de los platos

### Para Clientes

1. Accede a `/carta` para ver el menú público
2. Solo se muestran los platos marcados como disponibles

## 🗄️ Base de Datos

### Tabla `menu_items`

| Campo       | Tipo      | Descripción                                    |
| ----------- | --------- | ---------------------------------------------- |
| id          | UUID      | ID único del plato                             |
| name        | TEXT      | Nombre del plato                               |
| description | TEXT      | Descripción del plato                          |
| price       | DECIMAL   | Precio (2 decimales)                           |
| category    | TEXT      | Categoría (Entradas, Platos Principales, etc.) |
| available   | BOOLEAN   | Si el plato está disponible                    |
| created_at  | TIMESTAMP | Fecha de creación                              |

### Políticas de Seguridad (RLS)

- **Lectura pública**: Cualquiera puede ver platos `available = true`
- **Lectura completa**: Usuarios autenticados pueden ver todos los platos
- **Escritura**: Solo usuarios autenticados pueden crear/editar/eliminar

## 🚢 Despliegue

### Vercel (Recomendado)

1. Sube el proyecto a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Despliega

### Otras plataformas

Asegúrate de configurar las variables de entorno en tu plataforma de hosting.

## 👨‍💻 Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## 🐛 Solución de problemas

### Error de autenticación

- Verifica que las variables de entorno estén correctamente configuradas
- Confirma que el callback URL esté permitido en Supabase (Settings → Auth → URL Configuration)

### No se muestran los platos

- Verifica que la tabla `menu_items` esté creada
- Asegúrate de que las políticas RLS estén correctamente configuradas
- Revisa la consola del navegador para errores

### Errores de TypeScript

```bash
npm run build
```

Esto te mostrará todos los errores de tipo.

---

¡Disfruta gestionando tu menú! 🍽️
