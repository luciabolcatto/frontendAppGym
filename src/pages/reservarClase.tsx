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
  const { claseId, claseNombre } = (location.state || {}) as {
    claseId?: string;
    claseNombre?: string;
  };

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  if (!claseId || !usuario) {
    return (
      <div className="reservar-clase-page">
        <h2>No se encontró la información de la clase o usuario.</h2>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  const handleConfirmar = async () => {
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
          estado: 'confirmada',
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

      setSuccess('¡Reserva confirmada!');
      setTimeout(() => navigate('/clases'), 1500);
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
          ¿Deseas reservar la clase <strong>{claseNombre}</strong>?
        </p>
        <div className="reservar-info">
          <p>
            <strong>Usuario:</strong> {usuario.nombre} {usuario.apellido}
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
            {loading ? 'Reservando...' : 'Confirmar'}
          </button>
          <button
            className="btn-cancelar"
            onClick={() => navigate('/clases')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservarClase;
