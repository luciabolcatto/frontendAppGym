# Gym App - Frontend 

Cliente web para el Sistema de Gestión de Gimnasios, desarrollado con **React**, **Vite** y **TypeScript**.

## Tecnologías
- **Core:** React 18, TypeScript, React Router DOM v6.
- **Estilos:** Tailwind CSS v4, Lucide React.
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

2. **Configurar .env:** [br]
VITE_API_URL=[https://backendappgym.onrender.com](https://backendappgym.onrender.com)

3. **Iniciar:**
    ```bash
   pnpm dev

## Testing 
- `pnpm test` (Unitarios).

- `pnpm test:e2e` (Flujos completos).

- `pnpm test:star` (Test de Valoraciones).

- `pnpm test:pago` (Test de Modal de Pago).

## Deploy
Configurado para **Vercel** con soporte para rutas SPA.
