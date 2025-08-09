import React, { useEffect, useState } from 'react';

interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  cupo: number;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5500/api';

const ActividadesPage: React.FC = () => {
  const [data, setData] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/actividad`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(Array.isArray(json.data) ? json.data : []);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setError(e.message || 'Error desconocido');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadFlag]);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Actividades</h1>
      <button
        style={{ marginBottom: '1rem' }}
        onClick={() => setReloadFlag((n) => n + 1)}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Recargar'}
      </button>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      {loading && !error && <div>Cargando actividades...</div>}
      {!loading && !error && data.length === 0 && <div>No hay actividades.</div>}
      {!loading && !error && data.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
          {data.map((a) => (
            <li
              key={a.id}
              style={{
                border: '1px solid #444',
                borderRadius: 4,
                padding: '0.75rem',
                background: '#111',
                color: '#eee',
              }}
            >
              <strong style={{ color: '#00bfff' }}>{a.nombre}</strong>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{a.descripcion}</div>
              <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Cupo: {a.cupo}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActividadesPage;
