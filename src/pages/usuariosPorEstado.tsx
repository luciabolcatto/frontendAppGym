import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { EstadoContrato } from '../types/contrato';
import './usuariosPorEstado.css';

interface UsuarioEstado {
  idUsuario: number;
  nombre: string;
  apellido: string;
  fecha_hora_ini: string | null;
  fecha_hora_fin: string | null;
  estado: string;
  membresia: string;
  metodoPago: string;
  fechaPago: string | null;
  fechaCancelacion: string | null;
}

const UsuariosPorEstado = (): React.JSX.Element => {
  const [estado, setEstado] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioEstado[]>([]);
  const navigate = useNavigate();

  // Verificar permisos de admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    // Limpiar tabla primero cuando cambia el estado
    setUsuarios([]);
    
    // Si no hay estado seleccionado, mantener tabla vacía
    if (!estado) {
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`http://localhost:5500/api/contratos/filtrado?estado=${estado}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al traer usuarios');
        setUsuarios(data.data);
      } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor');
        setUsuarios([]); // Limpiar en caso de error también
      }
    };

    fetchUsuarios();
  }, [estado]);

  return (
    <div className="usuarios-container">
      <h1 className="usuarios-title">Usuarios por Estado de Contrato</h1>

      <div className="usuarios-filtro">
        <label>Filtrar por estado:</label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">-- Selecciona un estado --</option>
          <option value={EstadoContrato.PENDIENTE}>Pendiente</option>
          <option value={EstadoContrato.PAGADO}>Pagado</option>
          <option value={EstadoContrato.CANCELADO}>Cancelado</option>
          <option value={EstadoContrato.VENCIDO}>Vencido</option>
          <option value="sin-contrato">Sin contrato</option>
        </select>
      </div>

      {usuarios.length > 0 && (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Membresía</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Método de Pago</th>
              <th>Fecha de Pago</th>
              <th>Fecha de Cancelación</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idUsuario}>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.membresia}</td>
                <td>{u.fecha_hora_ini ? new Date(u.fecha_hora_ini).toLocaleString() : '-'}</td>
                <td>{u.fecha_hora_fin ? new Date(u.fecha_hora_fin).toLocaleString() : '-'}</td>
                <td>{u.metodoPago === 'N/A' ? '-' : u.metodoPago}</td>
                <td>{u.fechaPago ? new Date(u.fechaPago).toLocaleString() : '-'}</td>
                <td>{u.fechaCancelacion ? new Date(u.fechaCancelacion).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="volver-admin">
        <Link to="/admin"> Volver al Menú Admin</Link>
      </div>
    </div>
    
  );
};

export default UsuariosPorEstado;