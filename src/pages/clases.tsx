import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUsuario } from '../hooks/useUsuario';
import './clases.css';

interface Actividad {
  id: string;
  nombre: string;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:5500';

function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
}

function formatDate(dateLike: any) {
  if (!dateLike) return '';
  const d = dateLike?.$date ? new Date(dateLike.$date) : new Date(dateLike);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

function formatTime(dateLike: any) {
  if (!dateLike) return '';
  const d = dateLike?.$date ? new Date(dateLike.$date) : new Date(dateLike);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ClasesPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  
  // Estados para filtros
  const [fecha, setFecha] = useState<string>('');
  const [selectedActividadId, setSelectedActividadId] = useState<string>('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = useUsuario();

  const handleReservar = (claseId: string, claseNombre: string) => {
    if (!usuario) {
      alert('Debes iniciar sesión para reservar una clase');
      navigate('/login');
      return;
    }
    navigate('/reserva', {
      state: { claseId, claseNombre },
    });
  };

  const state: any = (location && (location as any).state) || {};
  const params = new URLSearchParams(location.search || '');
  const actividadId =
    state?.actividadId || params.get('actividadId') || undefined;
  const actividadNombre =
    state?.actividadNombre || params.get('actividadNombre') || undefined;

  // Cargar actividades al montar el componente
  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/actividad`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al cargar actividades');
        setActividades(data.data);
      } catch (error) {
        console.error('Error cargando actividades:', error);
      }
    };

    fetchActividades();
  }, []);

  // Inicializar filtros con valores de URL si existen y aplicar filtro automáticamente
  useEffect(() => {
    if (actividadId && actividades.length > 0) {
      setSelectedActividadId(actividadId);
      // Aplicar filtro automáticamente cuando viene de actividades
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        filtrarClases();
      }, 50);
    }
  }, [actividadId, actividades]);

  // Función para filtrar y ordenar clases por tiempo
  const filterAndSortClases = (clases: any[]) => {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    return clases
      .filter((c) => {
        const fechaInicio = c.fecha_hora_ini?.$date ? new Date(c.fecha_hora_ini.$date) : new Date(c.fecha_hora_ini);
        if (isNaN(fechaInicio.getTime())) return false;
        
        // Solo mostrar clases que empiecen después de 30 minutos desde ahora
        return fechaInicio > thirtyMinutesFromNow;
      })
      .sort((a, b) => {
        const fechaA = a.fecha_hora_ini?.$date ? new Date(a.fecha_hora_ini.$date) : new Date(a.fecha_hora_ini);
        const fechaB = b.fecha_hora_ini?.$date ? new Date(b.fecha_hora_ini.$date) : new Date(b.fecha_hora_ini);
        
        // Ordenar de menor a mayor (más próximas primero)
        return fechaA.getTime() - fechaB.getTime();
      });
  };

  // Cargar todas las clases al inicio (sin filtros)
  useEffect(() => {
    let mounted = true;
    
    const fetchClasesIniciales = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`${API_BASE}/api/clases/todas-ordenadas`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        
        let clases: any[] = json?.data ?? [];

        const normalized = clases.map((c) => {
          const id = c._id ?? c.id;
          const fecha_hora_ini = c.fecha_hora_ini ?? null;
          const fecha_hora_fin = c.fecha_hora_fin ?? null;
          const cupo_disp = c.cupo_disp ?? null;
          const entrenador = c.entrenador ?? null;
          const actividad = c.actividad ?? null;
          const reservas = Array.isArray(c.reservas)
            ? c.reservas
            : c.reservas
            ? [c.reservas]
            : [];
          return {
            ...c,
            id,
            fecha_hora_ini,
            fecha_hora_fin,
            cupo_disp,
            entrenador,
            actividad,
            reservas,
          };
        });

        // Filtrar y ordenar las clases
        const clasesDisponibles = filterAndSortClases(normalized);
        setItems(clasesDisponibles);
      } catch (e: any) {
        if (!mounted) return;
        setError('Error al cargar las clases.');
        console.error('Error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClasesIniciales();

    return () => {
      mounted = false;
    };
  }, []); // Solo se ejecuta una vez al montar



  const filtrarClases = async () => {
    try {
      setLoading(true);
      
      let url = `${API_BASE}/api/clases/todas-ordenadas?`;
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (fecha) params.append('fecha', fecha);
      if (selectedActividadId) params.append('actividadId', selectedActividadId);
      
      const finalUrl = url + params.toString();
      console.log('Filtrando clases:', finalUrl);
      
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      let clases: any[] = json?.data ?? [];

      const normalized = clases.map((c) => {
        const id = c._id ?? c.id;
        const fecha_hora_ini = c.fecha_hora_ini ?? null;
        const fecha_hora_fin = c.fecha_hora_fin ?? null;
        const cupo_disp = c.cupo_disp ?? null;
        const entrenador = c.entrenador ?? null;
        const actividad = c.actividad ?? null;
        const reservas = Array.isArray(c.reservas)
          ? c.reservas
          : c.reservas
          ? [c.reservas]
          : [];
        return {
          ...c,
          id,
          fecha_hora_ini,
          fecha_hora_fin,
          cupo_disp,
          entrenador,
          actividad,
          reservas,
        };
      });

      // Filtrar y ordenar las clases
      const clasesDisponibles = filterAndSortClases(normalized);
      setItems(clasesDisponibles);
    } catch (e: any) {
      setError('Error al filtrar las clases.');
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = async () => {
    setFecha('');
    setSelectedActividadId('');
    
    // Recargar todas las clases sin filtros
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/clases/todas-ordenadas`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      let clases: any[] = json?.data ?? [];

      const normalized = clases.map((c) => {
        const id = c._id ?? c.id;
        const fecha_hora_ini = c.fecha_hora_ini ?? null;
        const fecha_hora_fin = c.fecha_hora_fin ?? null;
        const cupo_disp = c.cupo_disp ?? null;
        const entrenador = c.entrenador ?? null;
        const actividad = c.actividad ?? null;
        const reservas = Array.isArray(c.reservas)
          ? c.reservas
          : c.reservas
          ? [c.reservas]
          : [];
        return {
          ...c,
          id,
          fecha_hora_ini,
          fecha_hora_fin,
          cupo_disp,
          entrenador,
          actividad,
          reservas,
        };
      });

      // Filtrar y ordenar las clases
      const clasesDisponibles = filterAndSortClases(normalized);
      setItems(clasesDisponibles);
    } catch (e: any) {
      setError('Error al recargar las clases.');
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clases-page">
        <div className="hero">
          <h1 className="hero-title">CLASES</h1>
        </div>
        <div className="clases-grid">
          <div className="class-card placeholder h-80" />
          <div className="class-card placeholder h-80" />
          <div className="class-card placeholder h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clases-page">
        <div className="hero">
          <h1 className="hero-title">CLASES</h1>
        </div>
        <div className="clases-grid">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clases-page">
      <div className="hero">
        <h1 className="hero-title">CLASES</h1>
      </div>

      {actividadNombre && (
        <p className="subhead">
          Actividad: <strong>{actividadNombre}</strong>
        </p>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-row">
          <div className="filtro-grupo">
            <label htmlFor="fecha-filtro">Fecha:</label>
            <input
              id="fecha-filtro"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="actividad-filtro">Actividad:</label>
            <select 
              id="actividad-filtro"
              value={selectedActividadId} 
              onChange={(e) => setSelectedActividadId(e.target.value)}
            >
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
      </div>

      <div className="clases-grid">
        {items.length === 0 && (
          <p className="muted">No hay clases disponibles.</p>
        )}

        {items.map((c) => {
          const actividad = c?.actividad;
          const entrenador = c?.entrenador;

          const img = resolveImageUrl(
            entrenador?.fotoUrl ??
              actividad?.imagenUrl ??
              entrenador?.foto ??
              actividad?.imagen
          );

          const title =
            actividad?.nombre ??
            c?.nombre ??
            `${entrenador?.nombre ?? 'Clase'}`;

          const fecha = formatDate(c.fecha_hora_ini);
          const horaInicio = formatTime(c.fecha_hora_ini);
          const horaFin = formatTime(c.fecha_hora_fin);
          const cupo = c.cupo_disp ?? 'N/A';
          
          // Calcular reservas ocupadas (solo PENDIENTE y CERRADA)
          const reservasOcupadas = Array.isArray(c.reservas)
            ? c.reservas.filter((reserva: any) => 
                reserva.estado === 'pendiente' || reserva.estado === 'cerrada'
              ).length
            : 0;
          
          // Calcular cupo disponible
          const cupoTotal = typeof cupo === 'number' ? cupo : parseInt(cupo) || 0;
          const cupoDisponible = cupoTotal - reservasOcupadas;

          return (
            <article key={c.id ?? c._id} className="class-card card">
              {img ? (
                <img
                  src={img}
                  alt={title}
                  className="class-img"
                  loading="lazy"
                />
              ) : (
                <div className="class-img placeholder">
                  <span className="opacity-70">Sin imagen</span>
                </div>
              )}

              <div className="class-body">
                <h3 className="class-title">{title}</h3>
                <p className="class-sub">
                  Entrenador:{' '}
                  {entrenador
                    ? `${entrenador.nombre ?? ''} ${entrenador.apellido ?? ''}`
                    : '—'}
                </p>
                <p className="class-desc">
                  {actividad?.descripcion ?? c?.descripcion ?? ''}
                </p>

                <div className="class-meta">
                  <div className="meta-left">
                    <div className="meta-item">
                      Fecha: <strong>{fecha}</strong>
                    </div>
                    <div className="meta-item">
                      Horario:{' '}
                      <strong>
                        {horaInicio} — {horaFin}
                      </strong>
                    </div>
                    <div className="meta-item">
                      Cupo:{' '}
                      <strong className={cupoDisponible === 0 ? 'text-red-500' : cupoDisponible <= 3 ? 'text-yellow-500' : 'text-green-500'}>
                        {reservasOcupadas}/{cupo} (Disponibles: {cupoDisponible})
                      </strong>
                    </div>
                  </div>
                  <div className="meta-right">
                    <button
                      className={`btn-pill ${cupoDisponible === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => cupoDisponible > 0 ? handleReservar(c.id ?? c._id, title) : null}
                      disabled={cupoDisponible === 0}
                      aria-label={`Reservar ${title}`}
                    >
                      {cupoDisponible === 0 ? 'Sin Cupo' : 'Reservar'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ClasesPage;
