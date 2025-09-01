import React, { useEffect, useState } from "react";
import "./planes.css";
import { Membresia } from "../types/membresia";

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5500";

const currency = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PlanesPage: React.FC = () => {
  const [items, setItems] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/membresias`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setItems(json?.data ?? []);
      } catch (e) {
        if (!mounted) return;
        setError("Error al cargar planes.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="planes-page">
      <div className="hero">
        <div className="text-center">
          <h1 className="hero-title">PLANES</h1>
          <p className="mt-2 text-sm md:text-base opacity-90">Elige el plan que mejor se ajuste a tus objetivos.</p>
        </div>
      </div>

      {loading && (
        <div className="planes-grid">
          <div className="plan-card" />
          <div className="plan-card" />
          <div className="plan-card" />
        </div>
      )}

      {error && !loading && (
        <div className="planes-grid"><p className="text-red-400">{error}</p></div>
      )}

      {!loading && !error && (
        <div className="planes-grid">
          {items.map((p) => (
            <article key={p.id} className="plan-card">
              <h3 className="plan-name">{p.nombre}</h3>
              <p className="plan-desc">{p.descripcion}</p>
              <div className="plan-price">{currency(p.precio)}</div>
              {p.meses == 1 ? (
                <div className="plan-meta">{p.meses} mes</div>
              ) : (
                <div className="plan-meta">{p.meses} meses</div>
              )}
              <button className="cta">¡Inscribite ya!</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
