import { Contrato, ContratoRequest, PagoRequest, ContratoResponse } from '../types/contrato';

const API_BASE_URL = 'http://localhost:5500/api';

/**
 * Servicio para gestionar contratos de membresías
 */
export class ContratoService {
  /**
   * Contrata una nueva membresía o renueva una existente
   */
  static async contratarMembresia(data: ContratoRequest): Promise<ContratoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/contratar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al contratar membresía:', error);
      throw error;
    }
  }

  /**
   * Simula el pago de un contrato pendiente
   */
  static async simularPago(data: PagoRequest): Promise<ContratoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/simular-pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al procesar pago:', error);
      throw error;
    }
  }

  /**
   * Cancela un contrato existente
   */
  static async cancelarContrato(contratoId: string): Promise<ContratoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/cancelar/${contratoId}`, {
        method: 'PATCH',
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
      console.error('Error al cancelar contrato:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los contratos de un usuario
   */
  static async obtenerContratosPorUsuario(usuarioId: string): Promise<{ data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/usuario/${usuarioId}`, {
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
      console.error('Error al obtener contratos del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene un contrato específico por ID
   */
  static async obtenerContrato(contratoId: string): Promise<{ data: Contrato }> {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/${contratoId}`, {
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
      console.error('Error al obtener contrato:', error);
      throw error;
    }
  }
}

/**
 * Servicio para gestionar membresías
 */
export class MembresiaService {
  /**
   * Obtiene todas las membresías disponibles
   */
  static async obtenerMembresias(): Promise<{ data: any[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/membresias`, {
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
      console.error('Error al obtener membresías:', error);
      throw error;
    }
  }

  /**
   * Obtiene una membresía específica por ID
   */
  static async obtenerMembresia(membresiaId: string): Promise<{ data: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/membresias/${membresiaId}`, {
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
      console.error('Error al obtener membresía:', error);
      throw error;
    }
  }
}