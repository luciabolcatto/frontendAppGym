
import { useState, useEffect } from 'react';
import type { Usuario } from '../types/usuario';

// Evento personalizado para notificar cambios en el usuario
export const USUARIO_UPDATED_EVENT = 'usuarioUpdated';

// Función para disparar el evento de actualización
export const notifyUsuarioUpdated = () => {
  window.dispatchEvent(new CustomEvent(USUARIO_UPDATED_EVENT));
};

// Hook para manejar el estado del usuario con recarga automática
export function useUsuario() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const loadUsuario = () => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('usuario');
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    // Cargar usuario inicial
    loadUsuario();

    // Escuchar evento de actualización
    const handleUsuarioUpdate = () => {
      loadUsuario();
    };

    window.addEventListener(USUARIO_UPDATED_EVENT, handleUsuarioUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(USUARIO_UPDATED_EVENT, handleUsuarioUpdate);
    };
  }, []);

  return usuario;
}