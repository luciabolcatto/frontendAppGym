import React, { useEffect, useState } from "react";
import { Actividad } from "../types/actividad";
import ActividadItem from "../components/ActividadItem";
import "./actividades.css";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5500/api";

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
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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
        setError(e.message || "Error desconocido");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [reloadFlag]);

  return (
    <div className="actividades-container">
      <h1 className="titulo">Actividades</h1>

      <button
        className="boton-recargar"
        onClick={() => setReloadFlag((n) => n + 1)}
        disabled={loading}
      >
        {loading ? "Cargando..." : "Recargar"}
      </button>

      {error && <div className="error">Error: {error}</div>}
      {loading && !error && <div className="cargando">Cargando actividades...</div>}
      {!loading && !error && data.length === 0 && <div className="no-data">No hay actividades.</div>}

      {!loading && !error && data.length > 0 && (
        <ul className="lista-actividades">
          {data.map((a) => (
            <ActividadItem key={a.id} actividad={a} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActividadesPage;
