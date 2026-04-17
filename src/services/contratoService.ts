import { Contrato, ContratoRequest, ContratoResponse } from '../types/contrato';
import { buildApiUrl } from '../shared/config';

function buildHeaders(requireAuth = false): HeadersInit {
  const token = localStorage.getItem('token');

  if (requireAuth && !token) {
    throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Servicio para gestionar contratos de membresías
 */
export class ContratoService {
  /**
   * Contrata una nueva membresía o renueva una existente
   */
  static async contratarMembresia(data: ContratoRequest): Promise<ContratoResponse> {
    try {
      const response = await fetch(buildApiUrl('/api/contratos/contratar'), {
        method: 'POST',
        headers: buildHeaders(),
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
   * Cancela un contrato existente
   */
  static async cancelarContrato(contratoId: string): Promise<ContratoResponse> {
    try {
      const response = await fetch(buildApiUrl(`/api/contratos/cancelar/${contratoId}`), {
        method: 'PATCH',
        headers: buildHeaders(),
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
      const response = await fetch(buildApiUrl(`/api/contratos/usuario/${usuarioId}`), {
        method: 'GET',
        headers: buildHeaders(true),
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
      const response = await fetch(buildApiUrl(`/api/contratos/${contratoId}`), {
        method: 'GET',
        headers: buildHeaders(true),
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
      const response = await fetch(buildApiUrl('/api/membresias'), {
        method: 'GET',
        headers: buildHeaders(),
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
      const response = await fetch(buildApiUrl(`/api/membresias/${membresiaId}`), {
        method: 'GET',
        headers: buildHeaders(),
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