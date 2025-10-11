import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './reservarClase.css';

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:5500';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  tel: string;
  mail: string;
}

const ReservarClase: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { claseId, claseNombre } = (location.state || {}) as {
    claseId?: string;
    claseNombre?: string;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Obtener usuario directamente desde localStorage
  useEffect(() => {
    const getUsuarioFromStorage = () => {
      try {
        const usuarioLocal = localStorage.getItem('usuario');
        if (usuarioLocal) {
          const parsed = JSON.parse(usuarioLocal);
          return parsed;
        }
      } catch (error) {
        console.error('ReservarClase - Error al parsear usuario:', error);
      }
      return null;
    };

    const usuarioData = getUsuarioFromStorage();
    setUsuario(usuarioData);
  }, []);

  // Redirigir a login si no hay usuario
  useEffect(() => {
    if (usuario === null) {
      // Dar tiempo para que se cargue el usuario
      const timer = setTimeout(() => {
        const storedUser = localStorage.getItem('usuario');
        if (!storedUser) {
          navigate('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [usuario, navigate]);

  if (!claseId) {
    return (
      <div className="reservar-clase-page">
        <h2>No se encontró la información de la clase.</h2>
        <button onClick={() => navigate('/clases')}>Volver a Clases</button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="reservar-clase-page">
        <div className="loading-container">
          <h2>Verificando autenticación...</h2>
          <p>Si no tienes una cuenta, serás redirigido al login.</p>
        </div>
      </div>
    );
  }

  const handleConfirmar = async () => {
    if (!usuario) {
      setError('No hay usuario autenticado');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Registrar la reserva
      const reservaRes = await fetch(`${API_BASE}/api/Reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_hora: new Date().toISOString(),
          estado: 'pendiente', // Usar 'pendiente' en lugar de 'confirmada'
          usuario: usuario.id,
          clase: claseId,
        }),
      });
      const reservaData = await reservaRes.json();
      if (!reservaRes.ok)
        throw new Error(reservaData.message || 'Error al reservar');

      // 2. Actualizar el cupo de la clase
      const cupoRes = await fetch(
        `${API_BASE}/api/clases/${claseId}/actualizar-cupo`,
        {
          method: 'PATCH',
        }
      );
      const cupoData = await cupoRes.json();
      if (!cupoRes.ok)
        throw new Error(cupoData.message || 'Error al actualizar cupo');

      setSuccess('¡Reserva confirmada! Redirigiendo a tus reservas...');
      setTimeout(() => navigate('/mis-reservas'), 2000);
    } catch (e: any) {
      setError(e.message || 'Error al reservar la clase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservar-clase-page">
      <div className="reservar-card">
        <h2>Confirmar Reserva</h2>
        <p>
          ¿Deseas reservar la clase <strong>{claseNombre || 'Clase desconocida'}</strong>?
        </p>
        <div className="reservar-info">
          <p>
            <strong>Usuario:</strong> {usuario.nombre} {usuario.apellido}
          </p>
          <p>
            <strong>Email:</strong> {usuario.mail}
          </p>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="reservar-actions">
          <button
            className="btn-confirmar"
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
          <button
            className="btn-cancelar"
            onClick={() => navigate('/clases')}
            disabled={loading}
          >
            Volver a Clases
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservarClase;
