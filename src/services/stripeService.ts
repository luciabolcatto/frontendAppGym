import { 
  CheckoutSessionResponse, 
  SessionStatusResponse, 
  CreateCheckoutSessionRequest 
} from '../types/stripe';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

/**
 * Servicio para integración con Stripe Checkout
 */
export class StripeService {
  /**
   * Crea una sesión de Stripe Checkout para pagar un contrato pendiente.
   * Retorna la URL de checkout a la que se debe redirigir al usuario.
   * 
   * @param contratoId - ID del contrato a pagar
   * @returns Objeto con checkoutUrl y sessionId
   * @throws Error si la creación de la sesión falla
   */
  static async createCheckoutSession(contratoId: string): Promise<CheckoutSessionResponse> {
    try {
      const requestBody: CreateCheckoutSessionRequest = { contratoId };
      
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear sesión de checkout:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado de una sesión de pago de Stripe.
   * Útil para confirmar que el pago se completó correctamente.
   * 
   * @param sessionId - ID de la sesión de Stripe Checkout
   * @returns Estado de la sesión y datos del contrato asociado
   * @throws Error si la verificación falla
   */
  static async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al verificar estado de sesión:', error);
      throw error;
    }
  }
}
