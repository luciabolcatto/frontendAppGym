import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './clases.css';

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
  const location = useLocation();
  const navigate = useNavigate();

  const state: any = (location && (location as any).state) || {};
  const params = new URLSearchParams(location.search || '');
  const actividadId =
    state?.actividadId || params.get('actividadId') || undefined;
  const actividadNombre =
    state?.actividadNombre || params.get('actividadNombre') || undefined;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Agrega este log:
        console.log('Frontend actividadId:', actividadId);
        const url = actividadId
          ? `${API_BASE}/api/clases?actividadId=${encodeURIComponent(
              actividadId as string
            )}`
          : `${API_BASE}/api/clases`;
        const res = await fetch(url);
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

        setItems(normalized);
      } catch (e: any) {
        if (!mounted) return;
        setError('Error al cargar las clases.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [actividadId, actividadNombre]);

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
          const reservasCount = Array.isArray(c.reservas)
            ? c.reservas.length
            : Number(c.reservas ?? 0);

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
                      <strong>
                        {reservasCount}/{cupo}
                      </strong>
                    </div>
                  </div>
                  <div className="meta-right">
                    <button
                      className="btn-pill"
                      onClick={() =>
                        navigate('/reservas', {
                          state: { claseId: c.id ?? c._id, claseNombre: title },
                        })
                      }
                      aria-label={`Reservar ${title}`}
                    >
                      Reservar
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
