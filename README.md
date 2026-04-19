# Frontend App Gym

Aplicación frontend construida con React + Vite.

## Requisitos

- Node.js 18+
- pnpm

## Desarrollo local

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Configurar variables de entorno (crear archivo `.env` en la raíz del frontend):

   ```env
   VITE_API_URL=https://backendappgym.onrender.com
   ```

3. Ejecutar en modo desarrollo:

   ```bash
   pnpm dev
   ```

## Build de producción

```bash
pnpm build
```

## Deploy en Vercel

La app ya incluye `vercel.json` para soporte de rutas de React Router (SPA fallback).
