/**
 * Tipos para la integración con Stripe Checkout
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
