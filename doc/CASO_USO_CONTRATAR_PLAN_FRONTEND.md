# Caso de Uso: Contratar Plan - Frontend - Documentación Completa

## 📖 Descripción General

Implementación completa del frontend para el sistema de contratación de membresías del gimnasio. Proporciona una interfaz de usuario intuitiva y moderna que permite a los clientes ver, contratar, pagar y gestionar sus membresías de forma sencilla y segura.

## ✨ Características Principales

- **Interfaz Intuitiva**: Diseño moderno y responsive siguiendo los patrones de la aplicación
- **Gestión Completa de Contratos**: Visualización, contratación, pago y cancelación
- **Sistema de Pagos Simulado**: Modal interactivo con múltiples métodos de pago
- **Estados en Tiempo Real**: Actualización automática del estado de los contratos
- **Navegación Integrada**: Acceso desde página de perfil del usuario
- **Manejo de Errores**: Gestión robusta de errores y validaciones

## 🎯 Actores

- **Cliente/Usuario**: Usuario autenticado que puede contratar y gestionar membresías
- **Sistema Frontend**: Interfaz React que se comunica con el backend
- **Sistema Backend**: API que gestiona la lógica de negocio y persistencia

## 📋 Estados de Contrato en el Frontend

| Estado        | Color/Badge   | Acciones Disponibles  | Descripción                |
| ------------- | ------------- | --------------------- | -------------------------- |
| **PENDIENTE** | Amarillo/Warn | Pagar Ahora, Cancelar | Contrato creado, sin pagar |
| **PAGADO**    | Verde/Success | Cancelar              | Contrato activo y pagado   |
| **CANCELADO** | Rojo/Danger   | Ninguna               | Contrato cancelado         |
| **VENCIDO**   | Gris/Neutral  | Ninguna               | Contrato expirado          |

## 🔄 Flujo Principal del Caso de Uso

### Escenario 1: Contratación Desde Página de Planes

1. Usuario navega a la página "Planes"
2. Selecciona una membresía y hace clic en "Contratar Plan"
3. Sistema valida que el usuario esté autenticado
4. Sistema crea contrato en estado PENDIENTE
5. Usuario es redirigido a "Mis Contratos"
6. Usuario ve el nuevo contrato y puede proceder al pago

### Escenario 2: Proceso de Pago

1. Usuario hace clic en "Pagar Ahora" en un contrato pendiente
2. Se abre modal de pago con detalles del contrato
3. Usuario selecciona método de pago
4. Sistema procesa pago simulado (90% éxito)
5. Si exitoso: Contrato se actualiza a PAGADO
6. Si falla: Usuario puede reintentar

### Escenario 3: Gestión de Contratos

1. Usuario accede a "Mis Contratos" desde el perfil
2. Ve todos sus contratos organizados por estado
3. Puede pagar contratos pendientes
4. Puede cancelar contratos pagados o pendientes
5. Ve historial completo de transacciones

## 🎯 Componentes Implementados

### 1. Página de Planes (`src/pages/planes.tsx`)

**Funcionalidad:**

- ✅ Muestra todas las membresías disponibles
- ✅ Integración con sistema de contratación
- ✅ Validación de usuario autenticado
- ✅ Redirección automática a gestión de contratos

**Características Técnicas:**

- Uso de `MembresiaService` para obtener datos
- Validación de sesión con `localStorage`
- Manejo de errores con try-catch
- Navegación programática con `useNavigate`

```typescript
const handleContratarPlan = async (membresiaId: string) => {
  // Validación de usuario
  // Llamada al servicio de contratación
  // Manejo de respuesta y navegación
};
```

### 2. Página Mis Contratos (`src/pages/misContratos.tsx`)

**Funcionalidad:**

- ✅ Lista todos los contratos del usuario
- ✅ Organización por estados (activos, próximos, pendientes, etc.)
- ✅ Acciones contextuales por estado
- ✅ Actualización en tiempo real

**Características Técnicas:**

- Estado local con `useState` para contratos
- Efectos con `useEffect` para carga inicial
- Parseo inteligente de respuesta del backend
- Callbacks para actualización de estado

```typescript
const cargarContratos = async () => {
  // Obtención de contratos del backend
  // Parseo de estructura de datos
  // Actualización de estado local
};
```

### 3. Modal de Pago (`src/components/PagoModal.tsx`)

**Funcionalidad:**

- ✅ Interfaz de pago con detalles del contrato
- ✅ Selección de método de pago
- ✅ Procesamiento con feedback visual
- ✅ Manejo de errores y éxito

**Características Técnicas:**

- Componente modal con overlay
- Props tipadas con TypeScript
- Estado local para formulario
- Callbacks para comunicación con padre

```typescript
interface PagoModalProps {
  contrato: Contrato;
  isOpen: boolean;
  onClose: () => void;
  onPagoExitoso: (contratoActualizado: Contrato) => void;
}
```

### 4. Servicios de API (`src/services/contratoService.ts`)

**Funcionalidad:**

- ✅ Abstracción de llamadas HTTP al backend
- ✅ Manejo centralizado de errores
- ✅ Tipado completo de requests/responses
- ✅ Gestión de autenticación

**Métodos Implementados:**

```typescript
class ContratoService {
  static async contratarMembresia(request: ContratoRequest);
  static async simularPago(request: PagoRequest);
  static async cancelarContrato(contratoId: string);
  static async obtenerContratosPorUsuario(usuarioId: string);
}
```

### 5. Sistema de Tipos (`src/types/contrato.ts`)

**Funcionalidad:**

- ✅ Definiciones TypeScript para type safety
- ✅ Enums para estados y constantes
- ✅ Interfaces para requests y responses
- ✅ Tipos reutilizables en toda la aplicación

```typescript
export enum EstadoContrato {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  CANCELADO = 'CANCELADO',
  VENCIDO = 'VENCIDO',
}

export interface Contrato {
  id: string;
  estado: EstadoContrato;
  fecha_hora_ini: string;
  fecha_hora_fin: string;
  fechaPago?: string;
  metodoPago?: string;
  fechaCancelacion?: string;
  usuario: Usuario;
  membresia: Membresia;
}
```

## 🎨 Sistema de Estilos

### Paleta de Colores Consistente

```css
:root {
  --celeste: #00bfff; /* Color principal del gimnasio */
  --negro: #0a0a0a; /* Fondo principal */
  --blanco: #ffffff; /* Texto principal */
}
```

### Componentes de UI

- **Tarjetas de Contrato**: Fondo translúcido con bordes celestes
- **Botones Primarios**: Gradiente celeste con efectos hover
- **Estados Badge**: Colores semántticos para cada estado
- **Modal**: Overlay oscuro con contenido centrado
- **Responsive**: Diseño adaptativo para móviles y desktop

## 🔍 Flujos Alternativos

### A1. Usuario no autenticado intenta contratar

**Resultado:** Redirección a login

- Sistema detecta ausencia de sesión
- Muestra mensaje informativo
- Redirige a página de login

### A2. Error en el proceso de pago

**Resultado:** Mensaje de error con opción de reintento

- Modal permanece abierto
- Muestra mensaje de error específico
- Usuario puede cambiar método y reintentar

### A3. Carga de contratos sin datos

**Resultado:** Interfaz vacía amigable

- Muestra mensaje informativo
- Sugiere contratar primera membresía
- Botón directo a página de planes

### A4. Error de conectividad

**Resultado:** Manejo graceful de errores

- Mensajes de error informativos
- Opción de recargar página
- Estado de loading mientras se reintenta

## 🛠️ Implementación Técnica

### Estructura de Archivos

```
src/
├── components/
│   ├── PagoModal.tsx           # Modal de procesamiento de pagos
│   └── PagoModal.css           # Estilos del modal
├── pages/
│   ├── misContratos.tsx        # Página principal de gestión
│   ├── misContratos.css        # Estilos de la página
│   └── planes.tsx              # Página de contratación (modificada)
├── services/
│   └── contratoService.ts      # Servicios de API
├── types/
│   └── contrato.ts             # Definiciones de tipos
└── App.tsx                     # Rutas (modificado)
```

### Integración con React Router

```typescript
// App.tsx - Nuevas rutas añadidas
<Route path="/mis-contratos" element={<MisContratos />} />
```

### Gestión de Estado

**Estado Local por Componente:**

- `misContratos.tsx`: Lista de contratos y estado de carga
- `PagoModal.tsx`: Estado del formulario y procesamiento
- `planes.tsx`: Estado de carga y membresías

**Persistencia:**

- Sesión de usuario en `localStorage`
- Datos de contratos obtenidos del backend en cada carga

### Llamadas a la API

**Base URL:** `http://localhost:5500/api`

**Endpoints Utilizados:**

- `GET /membresias` - Obtener membresías disponibles
- `POST /contratos/contratar` - Crear nuevo contrato
- `GET /contratos/usuario/:id` - Obtener contratos del usuario
- `POST /contratos/simular-pago` - Procesar pago
- `PATCH /contratos/cancelar/:id` - Cancelar contrato

## 🔒 Seguridad y Validaciones

### Validaciones Frontend

- **Autenticación**: Verificación de sesión antes de operaciones
- **Validación de Datos**: Tipado estricto con TypeScript
- **Sanitización**: Escape de datos en renderizado
- **Error Boundaries**: Manejo controlado de errores

### Comunicación Segura

- **Headers HTTP**: Incluye user-agent y content-type
- **Manejo de Errores**: No exposición de información sensible
- **Validación de Respuestas**: Verificación de estructura de datos

## 📱 Responsive Design

### Breakpoints

- **Desktop**: > 768px - Grid completo y modales centrados
- **Tablet**: 481px - 768px - Grid adaptativo
- **Mobile**: < 480px - Layout de una columna

### Adaptaciones Móviles

- Títulos escalables con `clamp()`
- Grids responsive con `auto-fill`
- Modales adaptables al viewport
- Botones con tamaño táctil adecuado

## 🧪 Testing y Calidad

### Validaciones Implementadas

- **TypeScript**: Tipado estricto en toda la aplicación
- **Error Handling**: Try-catch en todas las operaciones async
- **Loading States**: Feedback visual durante operaciones
- **User Feedback**: Mensajes claros de éxito y error

### Testing Manual Realizado

- ✅ Flujo completo de contratación
- ✅ Proceso de pago exitoso y fallido
- ✅ Cancelación de contratos
- ✅ Navegación entre páginas
- ✅ Responsive en diferentes dispositivos
- ✅ Manejo de estados edge cases

## 🚀 Mejoras Futuras

### Funcionalidades Pendientes

1. **Notificaciones Push**

   - Recordatorios de vencimiento
   - Confirmaciones de pago
   - Promociones especiales

2. **Modo Offline**

   - Cache de datos con Service Workers
   - Sincronización cuando vuelve conexión
   - Estados offline informativos

3. **Optimización de Performance**

   - Lazy loading de componentes
   - Memoización de componentes pesados
   - Virtual scrolling para listas grandes

4. **Accesibilidad Mejorada**

   - ARIA labels completos
   - Navegación por teclado
   - Alto contraste

5. **Analytics**
   - Tracking de eventos de usuario
   - Métricas de conversión
   - Análisis de abandono

## ⚡ Configuración y Uso

### Prerequisitos

- React 18+ con TypeScript
- React Router v6
- Node.js para desarrollo
- Backend API corriendo en puerto 5500

### Instalación y Configuración

1. Dependencias ya incluidas en el proyecto base
2. Archivos creados y configurados
3. Rutas integradas en App.tsx
4. Navegación desde perfil configurada

### Estructura de Navegación

```
Home → Planes → Contratar → Mis Contratos
     ↘ Perfil → Mis Contratos
```

### Testing en Desarrollo

1. Iniciar servidor de desarrollo: `npm run dev`
2. Asegurar backend corriendo en puerto 5500
3. Crear usuario y loguearse
4. Navegar a Planes y contratar membresía
5. Gestionar contratos desde Perfil

## 📝 Notas de Implementación

### Decisiones de Diseño

- **Modal vs Página**: Se eligió modal para pagos por mejor UX
- **Estado Local**: Se prefirió sobre Context por simplicidad
- **Servicios Separados**: Abstracción clara de lógica de API
- **CSS Modules**: Consistencia con el resto del proyecto

### Optimizaciones Realizadas

- **Tipado Estricto**: Prevención de errores en tiempo de compilación
- **Error Boundaries**: Manejo graceful de errores inesperados
- **Loading States**: Feedback inmediato al usuario
- **Responsive First**: Diseño móvil desde el inicio

### Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+
- **Dispositivos**: Responsive desde 320px
- **React**: Compatible con React 18+
- **TypeScript**: Versión 4.9+

Este frontend proporciona una experiencia completa y profesional para la gestión de contratos de membresía, integrándose perfectamente con el sistema backend existente y manteniendo la consistencia visual del proyecto.
