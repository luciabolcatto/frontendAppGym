import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './misReservas.css';

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:5500';

interface Reserva {
  id: string;
  fecha_hora: string;
  estado: 'pendiente' | 'cerrada' | 'cancelada';
  clase: {
    id: string;
    fecha_hora_ini: string;
    fecha_hora_fin: string;
    cupo_disp: number;
    actividad: {
      id: string;
      nombre: string;
      descripcion: string;
      imagenUrl?: string;
    };
    entrenador: {
      id: string;
      nombre: string;
      apellido: string;
      fotoUrl?: string;
    };
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit',
    minute: '2-digit'
  });
}

const MisReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const navigate = useNavigate();

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
        console.error('MisReservas - Error al parsear usuario:', error);
      }
      return null;
    };

    const usuarioData = getUsuarioFromStorage();
    setUsuario(usuarioData);
  }, []);

  useEffect(() => {
    if (usuario) {
      cargarReservas();
    } else {
      // Si no hay usuario después de intentar obtenerlo, redirigir al login
      const storedUser = localStorage.getItem('usuario');
      if (!storedUser) {
        navigate('/login');
      }
    }
  }, [usuario, navigate]);

  const cargarReservas = async () => {
    if (!usuario) {
      return;
    }
    
    try {
      setLoading(true);
      
     
      const response = await fetch(`${API_BASE}/api/Reservas?usuario=${usuario.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar reservas');
      }
      
      // Ordenar reservas por fecha de reserva (más nueva a más vieja)
      const reservasOrdenadas = (data.data || []).sort((a: Reserva, b: Reserva) => {
        const fechaReservaA = new Date(a.fecha_hora);
        const fechaReservaB = new Date(b.fecha_hora);
        return fechaReservaB.getTime() - fechaReservaA.getTime(); // Más nueva primero
      });
      
      setReservas(reservasOrdenadas);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las reservas');
      console.error('Error cargando reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (reservaId: string) => {
    if (!usuario || cancelando) return;
    
    
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }
    
    try {
      setCancelando(reservaId);
      const response = await fetch(`${API_BASE}/api/Reservas/${reservaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'cancelada'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar reserva');
      }
      
      // Recargar las reservas
      await cargarReservas();
      
      // Mostrar mensaje de éxito
      setMensaje('Reserva cancelada exitosamente. El cupo ha sido liberado para otros usuarios.');
      setTimeout(() => setMensaje(''), 4000);
      
    } catch (err: any) {
      alert('Error al cancelar la reserva: ' + err.message);
      console.error('Error cancelando reserva:', err);
    } finally {
      setCancelando(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'cerrada': return 'estado-cerrada';
      case 'cancelada': return 'estado-cancelada';
      default: return '';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'cerrada': return 'Cerrada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  const puedeSerCancelada = (reserva: Reserva): boolean => {
    if (reserva.estado !== 'pendiente') return false;
    
    const fechaClase = new Date(reserva.clase.fecha_hora_ini);
    const ahora = new Date();
    const tiempoRestante = fechaClase.getTime() - ahora.getTime();
    const minutosRestantes = tiempoRestante / (1000 * 60);
    
    // Se puede cancelar hasta 30 minutos antes de la clase 
    return minutosRestantes > 30;
  };

  if (!usuario) {
    return (
      <div className="mis-reservas-page">
        <div className="auth-required">
          <h2>Debes iniciar sesión</h2>
          <button onClick={() => navigate('/login')}>Ir a Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mis-reservas-page">
        <div className="hero">
          <h1>Mis Reservas</h1>
        </div>
        <div className="loading">Cargando reservas...</div>
      </div>
    );
  }

  return (
    <div className="mis-reservas-page">
      <div className="hero">
        <h1>Mis Reservas</h1>
        <p>Aquí puedes ver y gestionar todas tus reservas</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={cargarReservas}>Reintentar</button>
        </div>
      )}

      {mensaje && (
        <div className="success-message">
          {mensaje}
        </div>
      )}

      <div className="reservas-container">
        {reservas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes reservas aún</h3>
            <p>Explora nuestras clases y reserva tu primera sesión.</p>
            <button onClick={() => navigate('/clases')} className="btn-primary">
              Ver Clases Disponibles
            </button>
          </div>
        ) : (
          <>
            {/* Estadísticas rápidas */}
            <div className="reservas-stats">
              <div className="stat">
                <span className="stat-number">{reservas.filter(r => r.estado === 'pendiente').length}</span>
                <span className="stat-label">Pendientes</span>
              </div>
              <div className="stat">
                <span className="stat-number">{reservas.filter(r => r.estado === 'cerrada').length}</span>
                <span className="stat-label">Cerradas</span>
              </div>
              <div className="stat">
                <span className="stat-number">{reservas.filter(r => r.estado === 'cancelada').length}</span>
                <span className="stat-label">Canceladas</span>
              </div>
            </div>

            <div className="reservas-grid">
              {reservas.map((reserva) => {
                return (
                <div key={reserva.id} className={`reserva-card reserva-${reserva.estado}`}>
                  <div className="reserva-header">
                    <h3 style={{color: '#00bfff !important'}}>{reserva.clase.actividad.nombre}</h3>
                    <div className="estado-container">
                      <span 
                        className={`estado ${getEstadoColor(reserva.estado)}`}
                        style={{
                          backgroundColor: reserva.estado === 'pendiente' ? 'rgba(255, 152, 0, 0.3)' :
                                          reserva.estado === 'cerrada' ? 'rgba(76, 175, 80, 0.3)' :
                                          'rgba(244, 67, 54, 0.3)',
                          color: reserva.estado === 'pendiente' ? '#ff9800' :
                                reserva.estado === 'cerrada' ? '#4caf50' :
                                '#f44336',
                          border: '2px solid',
                          borderColor: reserva.estado === 'pendiente' ? '#ff9800' :
                                      reserva.estado === 'cerrada' ? '#4caf50' :
                                      '#f44336'
                        }}
                      >
                        {getEstadoTexto(reserva.estado)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="reserva-info">
                    <div className="info-item">
                      <strong> Fecha de clase:</strong> {formatDate(reserva.clase.fecha_hora_ini)}
                    </div>
                    <div className="info-item">
                      <strong> Horario:</strong> {formatTime(reserva.clase.fecha_hora_ini)} - {formatTime(reserva.clase.fecha_hora_fin)}
                    </div>
                    <div className="info-item">
                      <strong> Entrenador:</strong> {reserva.clase.entrenador.nombre} {reserva.clase.entrenador.apellido}
                    </div>
                    <div className="info-item">
                      <strong>Reservada el:</strong> {formatDate(reserva.fecha_hora)} a las {formatTime(reserva.fecha_hora)}
                    </div>
                  </div>

                  <div className="reserva-actions">
                    {reserva.estado === 'pendiente' && (
                      <>
                        {puedeSerCancelada(reserva) ? (
                          <button
                            className="btn-cancelar"
                            onClick={() => cancelarReserva(reserva.id)}
                            disabled={cancelando === reserva.id}
                          >
                            {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar Reserva'}
                          </button>
                        ) : (
                          <span className="texto-no-cancelable">
                            Ya no se puede cancelar (menos de 30 min restantes)
                          </span>
                        )}
                      </>
                    )}
                    {reserva.estado === 'cancelada' && (
                      <span className="texto-cancelada">
                         Cancelada el {formatDate(reserva.fecha_hora)}
                      </span>
                    )}
                    {reserva.estado === 'cerrada' && (
                      <span className="texto-realizada">
                        Reserva cerrada 
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="navigation-actions">
        <button onClick={() => navigate('/perfil')} className="btn-secondary">
          Volver al Perfil
        </button>
        <button onClick={() => navigate('/clases')} className="btn-primary">
          Ver Más Clases
        </button>
      </div>
    </div>
  );
};

export default MisReservas;