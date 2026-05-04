# Gym App - Frontend

Cliente web para el Sistema de Gestión de Gimnasios, desarrollado con **React**, **Vite** y **TypeScript**.

## Tecnologías

- **Core:** React 18, TypeScript, React Router DOM v6.
- **Estilos:** Tailwind CSS v4, Lucide React, React Icons.
- **Pagos:** Stripe SDK.
- **Feedback:** React Hot Toast.
- **Testing:** Jest + React Testing Library.

## Estructura

- `components/`: UI reutilizable (Modales de pago, Valoraciones).
- `services/`: Comunicación con la API (Contratos, Reservas).
- `hooks/`: Lógica de estado y efectos.
- `types/`: Definiciones de interfaces TypeScript.
- `test/` & `e2e/`: Pruebas unitarias y de flujo completo.

## Instalación y Desarrollo

1. **Instalar dependencias:**

   ```bash
   pnpm install

   ```

2. **Configurar .env:** <br>

En produccion
 ```env
   VITE_API_URL=https://backendappgym.onrender.com
 ```

En desarrollo
 ```env
   VITE_API_URL=http://localhost:5173
 ```

4. **Iniciar:**
   ```bash
   pnpm dev
   ```

## Testing

- `pnpm test`: Ejecuta todos los tests.
- `pnpm test:components`: Ejecuta los tests de componentes.
- `pnpm test:e2e`: Ejecuta tests de flujo completo.
- `pnpm test:star`: Ejecuta tests de valoraciones.
- `pnpm test:pago`: Ejecuta tests del modal de pago.

## Deploy

Configurado para **Vercel** con soporte para rutas SPA (https://frontend-app-gym.vercel.app/).
