import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './usuariosPorEstado.css';

interface UsuarioEstado {
  idUsuario: number;
  nombre: string;
  apellido: string;
  fecha_hora_ini: string;
  fecha_hora_fin: string;
  estado: string;
  membresia: string;
}

const UsuariosPorEstado = (): React.JSX.Element => {
  const [estado, setEstado] = useState<string>('');
  const [usuarios, setUsuarios] = useState<UsuarioEstado[]>([]);

  useEffect(() => {
    // Limpiar tabla si no hay estado seleccionado
    if (!estado) {
      setUsuarios([]);
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
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="cancelado">Cancelado</option>
          <option value="terminado">Terminado</option>
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
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idUsuario}>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.membresia}</td>
                <td>{new Date(u.fecha_hora_ini).toLocaleString()}</td>
                <td>{new Date(u.fecha_hora_fin).toLocaleString()}</td>
                <td>{u.estado}</td>
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