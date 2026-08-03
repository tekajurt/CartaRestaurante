# Skills recomendadas para CartaRestaurante

Este proyecto usa **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4** y **SQLite** (`better-sqlite3`) con autenticación JWT propia. Según el objetivo, estas son las skills más útiles para cargar.

## Skills obligatorias / casi siempre

| Skill | Cuándo usar |
|-------|-------------|
| `react-expert` | Siempre. Cubre App Router, Server Components, Server Actions, React 19 y componentes cliente. Es la skill base para cualquier cambio en `src/app/` o `src/components/`. |
| `javascript-pro` | Siempre. Útil para TypeScript/ESM, async/await, manejo de errores y APIs de Node.js (crypto, cookies, fs). |

## Skills altamente recomendadas para este proyecto

| Skill | Cuándo usar |
|-------|-------------|
| `security-best-practices` | **Muy recomendada.** El proyecto tiene problemas de seguridad concretos: JWT manual, sal fija en PBKDF2, Server Actions de admin sin re-autorización, middleware no registrado, fallback de `JWT_SECRET` hardcodeado y registro de usuarios abierto. |
| `vercel-react-best-practices` | Para optimizar data fetching, renderizado, bundle y performance en Next.js/Vercel. Útil si se va a escalar o perfeccionar la aplicación. |
| `frontend-design` | Si se va a rediseñar o mejorar la UI de la carta pública (`/carta`) o el panel de administración (`/admin`) con Tailwind v4. |

## Skills opcionales según el próximo paso

| Skill | Cuándo usar |
|-------|-------------|
| `ponytail` | Para aplicar soluciones mínimas y directas (YAGNI). Útil si el objetivo es arreglar las vulnerabilidades con el menor cambio posible. |
| `devops-engineer` | Si se quiere añadir CI/CD, Docker, GitHub Actions, Kubernetes o automatizar despliegues. |
| `cloud-architect` | Si se va a desplegar en producción y hay que decidir dónde ubicar el archivo SQLite (no es adecuado para serverless sin volumen persistente). |

## Sugerencia de uso combinado

Para un plan típico de hardening y mejora de este proyecto, cargaría:

1. `react-expert` + `javascript-pro` — base técnica.
2. `security-best-practices` — para auditar y corregir auth, sesiones, hashing y Server Actions.
3. `vercel-react-best-practices` — para optimizar el rendimiento del App Router.
4. `frontend-design` — solo si el trabajo incluye mejoras visuales.

Si el objetivo es **solo parchear lo mínimo imprescindible**, añade `ponytail` al combo.

## Skills que NO aplica cargar

- `django-expert`, `fastapi-expert` — el backend no es Python.
- `ml-pipeline`, `computer-vision-opencv`, `senior-computer-vision` — no hay ML ni visión artificial.
- `tailscale`, `termux-api` — no son relevantes para una aplicación web de menú de restaurante.
- `bash-automation` — solo si se necesitan scripts de mantenimiento; no es prioridad.
- `yaml-config-validator` — útil solo si se añaden muchos YAMLs (CI/CD, K8s).

---

*Última actualización: generado durante el análisis de AGENTS.md + audit de seguridad.*
