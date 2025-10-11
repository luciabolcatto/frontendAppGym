import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Actividad } from '../types/actividad';
import './actividades.css';

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:5500';

function resolveImageUrl(a: Actividad): string | undefined {
  if (a.imagenUrl) {
    if (/^https?:\/\//i.test(a.imagenUrl)) return a.imagenUrl;
    const path = a.imagenUrl.startsWith('/') ? a.imagenUrl : `/${a.imagenUrl}`;
    return `${API_BASE}${path}`;
  }
  return undefined;
}

const ActividadesPage: React.FC = () => {
  const [items, setItems] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const navigate = useNavigate();

  // Obtener usuario desde localStorage
  useEffect(() => {
    const getUsuarioFromStorage = () => {
      try {
        const usuarioLocal = localStorage.getItem('usuario');
        if (usuarioLocal) {
          return JSON.parse(usuarioLocal);
        }
      } catch (error) {
        console.error('Actividades - Error al parsear usuario:', error);
      }
      return null;
    };

    const usuarioData = getUsuarioFromStorage();
    setUsuario(usuarioData);
  }, []);

  const handleVerClases = (actividadId: string, actividadNombre: string) => {
    if (!usuario) {
      alert('Debes iniciar sesión para ver las clases disponibles');
      navigate('/login');
      return;
    }
    navigate('/clases', {
      state: { actividadId, actividadNombre },
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/actividad`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setItems(json?.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError('Error al cargar actividades.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="actividades-page">
        <div className="hero">
          <h1 className="hero-title">ACTIVIDADES</h1>
        </div>
        <div className="actividades-grid">
          <div className="card placeholder rounded-[18px] h-[320px]"></div>
          <div className="card placeholder rounded-[18px] h-[320px]"></div>
          <div className="card placeholder rounded-[18px] h-[320px]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="actividades-page">
        <div className="hero">
          <h1 className="hero-title">ACTIVIDADES</h1>
        </div>
        <div className="actividades-grid">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="actividades-page">
      <div className="hero">
        <h1 className="hero-title">ACTIVIDADES</h1>
      </div>

      <div className="actividades-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((a) => {
          const img = resolveImageUrl(a);
          return (
            <article key={a.id} className="card">
              {img ? (
                <img
                  src={img}
                  alt={a.nombre}
                  className="card-img"
                  loading="lazy"
                />
              ) : (
                <div className="card-img placeholder rounded-[18px]">
                  <span className="opacity-70">Sin imagen</span>
                </div>
              )}

              <h3 className="card-title">{a.nombre}</h3>

              <p className="card-desc">{a.descripcion}</p>

              <div className="meta">
                <button
                  className="btn-pill"
                  onClick={() => handleVerClases(a.id, a.nombre)}
                  aria-label={`Ver clases de ${a.nombre}`}
                >
                  Clases
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ActividadesPage;
