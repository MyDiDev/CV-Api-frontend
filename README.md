# CV api client

## Stack

- React 19 + TypeScript
- Bootstrap 5
- React Router v7

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/register` | Crear cuenta |
| `/login` | Iniciar sesión |
| `/dashboard` | Estadísticas de uso de tu API Key |
| `/api-key` | Ver o generar tu API Key |
| `/documents` | Reportes PDF generados |

Las rutas `/dashboard`, `/api-key` y `/documents` requieren sesión activa.

## Instalación

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Despliegue en Vercel

Incluir un `vercel.json` en la raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Esto es necesario para que React Router funcione correctamente al acceder directamente a una ruta.

En Vercel, agregar la variable de entorno `CI=false` en **Settings → Environment Variables** para evitar que los warnings rompan el build.

## Estructura

```
src/
├── context/AuthContext.tsx   # JWT persistido en localStorage
├── services/api.ts           # Llamadas a la API
├── components/
│   ├── Navbar.tsx
│   └── PrivateRoute.tsx
└── pages/
    ├── Register.tsx
    ├── Login.tsx
    ├── Dashboard.tsx
    ├── ApiKeyPage.tsx
    └── Documents.tsx
```

## API

Apunta a `https://cv-api-uleg.onrender.com`. Para cambiarla, editar `src/services/api.ts`:

```ts
const BASE_URL = 'https://cv-api-uleg.onrender.com';
```
