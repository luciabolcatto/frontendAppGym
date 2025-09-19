import React, { useEffect, useState } from "react";
import "./planes.css";
import { Membresia } from "../types/membresia";
import { ContratoService, MembresiaService } from "../services/contratoService";
import { ContratoRequest } from "../types/contrato";

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5500";

const currency = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PlanesPage: React.FC = () => {
  const [items, setItems] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratando, setContratando] = useState<string | null>(null);
  const [usuario] = useState(() => {
    // Intentamos obtener el usuario del localStorage
    const storedUser = localStorage.getItem('usuario');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const response = await MembresiaService.obtenerMembresias();
        if (!mounted) return;
        setItems(response?.data ?? []);
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

  const handleContratarPlan = async (membresiaId: string) => {
    if (!usuario?.id) {
      alert("Debe estar logueado para contratar un plan");
      return;
    }

    setContratando(membresiaId);
    try {
      const request: ContratoRequest = {
        usuarioId: usuario.id,
        membresiaId: membresiaId
      };

      const response = await ContratoService.contratarMembresia(request);
      
      if (response.data.contrato) {
        const { contrato, esRenovacion } = response.data;
        const mensaje = esRenovacion 
          ? `¡Renovación programada exitosamente! Su nueva membresía comenzará el ${new Date(contrato.fecha_hora_ini).toLocaleDateString()}`
          : `¡Contrato creado exitosamente! Su membresía está pendiente de pago.`;
        
        alert(mensaje);
        
        // Redirigir a la página de contratos o mostrar modal de pago
        if (confirm("¿Desea proceder al pago ahora?")) {
          window.location.href = `/mis-contratos?pagar=${contrato.id}`;
        } else {
          // Si no quiere pagar ahora, ir a la página de contratos
          window.location.href = `/mis-contratos`;
        }
      }
    } catch (error) {
      console.error("Error al contratar plan:", error);
      alert(error instanceof Error ? error.message : "Error al contratar el plan");
    } finally {
      setContratando(null);
    }
  };

  return (
    <div className="planes-page">
      <div className="hero"><h1 className="hero-title">PLANES</h1></div>

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
              <div className="plan-meta">{p.meses} meses</div>
              <button 
                className="cta" 
                onClick={() => handleContratarPlan(p.id)}
                disabled={contratando === p.id}
              >
                {contratando === p.id ? "Contratando..." : "¡Contratar Plan!"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
