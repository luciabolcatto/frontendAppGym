/**
 * Tipos para la integración con Stripe Checkout y otros métodos de pago
 */

/**
 * Respuesta al crear una sesión de checkout de Stripe
 */
export interface CheckoutSessionResponse {
  message: string;
  checkoutUrl: string;
  sessionId: string;
}

/**
 * Respuesta al verificar el estado de una sesión de Stripe
 */
export interface SessionStatusResponse {
  sessionId: string;
  status: 'open' | 'complete' | 'expired';
  paymentStatus: 'unpaid' | 'paid' | 'no_payment_required';
  contrato: {
    id: string;
    estado: string;
    membresia: string;
  } | null;
}

/**
 * Request para crear una sesión de checkout
 */
export interface CreateCheckoutSessionRequest {
  contratoId: string;
}

/**
 * Datos bancarios para transferencias
 */
export interface DatosBancarios {
  banco: string;
  titular: string;
  cbu: string;
  alias: string;
}

/**
 * Método de pago disponible
 */
export interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  requiereRedireccion: boolean;
  datosBancarios?: DatosBancarios;
  instrucciones?: string;
}

/**
 * Respuesta al obtener métodos de pago disponibles
 */
export interface MetodosPagoResponse {
  message: string;
  data: MetodoPago[];
}

/**
 * Datos del contrato en respuestas de pago
 */
export interface ContratoDataResponse {
  id: string;
  estado: string;
  fechaPago: string;
  metodoPago: string;
}

/**
 * Respuesta al pagar con transferencia bancaria
 */
export interface PagoTransferenciaResponse {
  message: string;
  data: {
    contrato: ContratoDataResponse;
    membresia: string;
    monto: number;
    comprobante: string | null;
  };
}

/**
 * Respuesta al pagar en efectivo
 */
export interface PagoEfectivoResponse {
  message: string;
  data: {
    contrato: ContratoDataResponse;
    membresia: string;
    monto: number;
    reciboNumero: string;
  };
}
