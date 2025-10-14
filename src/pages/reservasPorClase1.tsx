import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './reservasPorClase1.css';

interface Actividad {
  id: string;
  nombre: string;
}

interface Clase {
  id: string;
  fecha_hora_ini: string;
  fecha_hora_fin: string; 
  cupo_disp: number;
  entrenador: {
    nombre: string;
    apellido: string;
  };
  actividad: {
    nombre: string;
  };
}

const ReservasPorClase1 = (): React.JSX.Element => {
  const [fecha, setFecha] = useState<string>('');
  const [actividadId, setActividadId] = useState<string>('');
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const navigate = useNavigate();

  // Verificar permisos de admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
      navigate('/admin-login');
      return;
    }
  }, [navigate]);

  // Cargar actividades al montar el componente
  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await fetch('http://localhost:5500/api/actividad');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar actividades');
        setActividades(data.data);
      } catch (error) {
        console.error(error);
        alert('Error al cargar actividades');
      }
    };

    fetchActividades();
  }, []);

  // Cargar todas las clases al inicio (sin filtros)
  useEffect(() => {
    const fetchClasesIniciales = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return;

        const res = await fetch('http://localhost:5500/api/clases/todas-ordenadas', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar clases');
        
        setClases(data.data);
      } catch (error) {
        console.error(error);
        alert('Error al cargar clases iniciales');
      }
    };

    fetchClasesIniciales();
  }, []);

  const filtrarClases = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) return;

      let url = 'http://localhost:5500/api/clases/todas-ordenadas?';
      
      const params = new URLSearchParams();
      if (fecha) params.append('fecha', fecha);
      if (actividadId) params.append('actividadId', actividadId);
      
      const res = await fetch(url + params.toString(), {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al filtrar clases');
      
      setClases(data.data);
    } catch (error) {
      console.error(error);
      alert('Error al filtrar clases');
    }
  };

  const limpiarFiltros = () => {
    setFecha('');
    setActividadId('');
    
    const fetchClases = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return;

        const res = await fetch('http://localhost:5500/api/clases/todas-ordenadas', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar clases');
        
        setClases(data.data);
      } catch (error) {
        console.error(error);
        alert('Error al recargar clases');
      }
    };

    fetchClases();
  };

  const verReservas = (claseId: string) => {
    navigate(`/admin/informe-reservas/clase/${claseId}`);
  };

  return (
    <div className="reservas-por-clase1-container">
      <h1 className="reservas-title">Informe de Reservas por Clase</h1>

      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        
        <div className="filtro-grupo">
          <label>Actividad:</label>
          <select value={actividadId} onChange={(e) => setActividadId(e.target.value)}>
            <option value="">-- Todas las actividades --</option>
            {actividades.map((actividad) => (
              <option key={actividad.id} value={actividad.id}>
                {actividad.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filtros-botones">
          <button className="btn-filtrar" onClick={filtrarClases}>
            Filtrar Clases
          </button>
          <button className="btn-limpiar" onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="clases-container">
        <h2>Clases disponibles ({clases.length})</h2>
        
        {clases.length > 0 ? (
          <div className="clases-grid">
            {clases.map((clase) => (
              <div key={clase.id} className="clase-card">
                <div className="clase-header">
                  <h3>{clase.actividad.nombre}</h3>
                </div>
                
                <div className="clase-info">
                  <p><strong>Entrenador:</strong> {clase.entrenador.nombre} {clase.entrenador.apellido}</p>
                  <p><strong>Fecha y hora:</strong> {new Date(clase.fecha_hora_ini).toLocaleString()}</p>
                </div>
                
                <button 
                  className="btn-ver-reservas"
                  onClick={() => verReservas(clase.id)}
                >
                  Ver Reservas
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-clases">No se encontraron clases con los filtros aplicados.</p>
        )}
      </div>

      <div className="volver-admin">
        <Link to="/admin">← Volver al Menú Admin</Link>
      </div>
    </div>
  );
};

export default ReservasPorClase1;