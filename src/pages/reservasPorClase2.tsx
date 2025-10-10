import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { EstadoReserva } from '../types/reserva';
import './reservasPorClase2.css';

interface ReservaDetalle {
  idActividad: string;
  nombreActividad: string;
  idUsuario: string;
  nombre: string;
  apellido: string;
  fecha_hora_ini: string;
  fecha_hora_fin: string;
  fecha_hora_reserva: string;
  estado_reserva: string;
}

const ReservasPorClase2 = (): React.JSX.Element => {
  const [reservas, setReservas] = useState<ReservaDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { claseId } = useParams<{ claseId: string }>();

  // Verificar permisos de admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  // Cargar reservas de la clase
  useEffect(() => {
    const fetchReservas = async () => {
      if (!claseId) {
        alert('ID de clase no válido');
        navigate('/admin/informe-reservas');
        return;
      }

      try {
        setLoading(true);
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return;

        const res = await fetch(`http://localhost:5500/api/Reservas/filtrado?claseId=${claseId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar reservas');
        
        setReservas(data.data);
      } catch (error) {
        console.error(error);
        alert('Error al cargar reservas de la clase');
        navigate('/admin/informe-reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [claseId, navigate]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerClaseEstado = (estado: string) => {
    return estado.toLowerCase();
  };

  if (loading) {
    return (
      <div className="reservas-por-clase2-container">
        <div className="loading">Cargando reservas...</div>
      </div>
    );
  }

  return (
    <div className="reservas-por-clase2-container">
      <div className="reservas-header">
        <h1 className="reservas-title">Reservas de la Clase</h1>
        
        {reservas.length > 0 && (
          <div className="clase-info">
            <h2>{reservas[0].nombreActividad}</h2>
            <p><strong>Horario:</strong> {formatearFecha(reservas[0].fecha_hora_ini)} - {formatearFecha(reservas[0].fecha_hora_fin)}</p>
            <p><strong>Total de reservas:</strong> {reservas.length}</p>
          </div>
        )}
      </div>

      <div className="navegacion-botones">
        <button 
          className="btn-volver-clases"
          onClick={() => navigate('/admin/informe-reservas')}
        >
          ← Volver a Lista de Clases
        </button>
      </div>

      {reservas.length > 0 ? (
        <div className="tabla-container">
          <table className="reservas-table">
            <thead>
              <tr>
                <th>ID Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha de Reserva</th>
                <th>Estado</th>
                <th>Actividad</th>
                <th>Horario Clase</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva, index) => (
                <tr key={`${reserva.idUsuario}-${index}`}>
                  <td>{reserva.idUsuario}</td>
                  <td>{reserva.nombre}</td>
                  <td>{reserva.apellido}</td>
                  <td>{formatearFecha(reserva.fecha_hora_reserva)}</td>
                  <td>
                    <span className={`estado ${obtenerClaseEstado(reserva.estado_reserva)}`}>
                      {reserva.estado_reserva}
                    </span>
                  </td>
                  <td>{reserva.nombreActividad}</td>
                  <td>
                    {formatearFecha(reserva.fecha_hora_ini)} - {formatearFecha(reserva.fecha_hora_fin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-reservas">
          <p>No hay reservas para esta clase.</p>
        </div>
      )}

      <div className="volver-admin">
        <Link to="/admin">← Volver al Menú Admin</Link>
      </div>
    </div>
  );
};

export default ReservasPorClase2;