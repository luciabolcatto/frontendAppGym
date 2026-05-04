import { 
  CheckoutSessionResponse, 
  SessionStatusResponse, 
  CreateCheckoutSessionRequest,
  MetodosPagoResponse,
  PagoTransferenciaResponse,
  PagoEfectivoResponse
} from '../types/stripe';
import { buildApiUrl } from '../shared/config';

function buildAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Servicio para integración con Stripe Checkout y otros métodos de pago
 */
export class StripeService {
  /**
   * Obtiene los métodos de pago disponibles en el sistema.
   * 
   * @returns Lista de métodos de pago con sus detalles
   * @throws Error si la obtención falla
   */
  static async getMetodosPago(): Promise<MetodosPagoResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/stripe/metodos-pago'), {
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
      console.error('Error al obtener métodos de pago:', error);
      throw error;
    }
  }

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
      
      const response = await fetch(buildApiUrl('/api/stripe/create-checkout-session'), {
        method: 'POST',
        headers: buildAuthHeaders(),
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
   * Procesa un pago con transferencia bancaria.
   * 
   * @param contratoId - ID del contrato a pagar
   * @param comprobanteNumero - Número de comprobante (opcional)
   * @returns Datos del contrato actualizado
   * @throws Error si el procesamiento falla
   */
  static async pagarConTransferencia(
    contratoId: string, 
    comprobanteNumero?: string
  ): Promise<PagoTransferenciaResponse> {
    try {
      const requestBody: { contratoId: string; comprobanteNumero?: string } = { contratoId };
      if (comprobanteNumero) {
        requestBody.comprobanteNumero = comprobanteNumero;
      }
      
      const response = await fetch(buildApiUrl('/api/stripe/pagar-transferencia'), {
        method: 'POST',
        headers: buildAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al procesar pago con transferencia:', error);
      throw error;
    }
  }

  /**
   * Procesa un pago en efectivo.
   * 
   * @param contratoId - ID del contrato a pagar
   * @returns Datos del contrato actualizado
   * @throws Error si el procesamiento falla
   */
  static async pagarConEfectivo(contratoId: string): Promise<PagoEfectivoResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/stripe/pagar-efectivo'), {
        method: 'POST',
        headers: buildAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ contratoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al procesar pago en efectivo:', error);
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
      const response = await fetch(buildApiUrl(`/api/stripe/session/${sessionId}`), {
        method: 'GET',
        headers: buildAuthHeaders(),
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
