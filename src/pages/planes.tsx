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
  const [contratosPendientes, setContratosPendientes] = useState<number>(0);
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
        
        // Cargar membresías
        const response = await MembresiaService.obtenerMembresias();
        if (!mounted) return;
        setItems(response?.data ?? []);
        
        // Cargar contratos pendientes del usuario si está logueado
        if (usuario?.id) {
          const pendientes = await verificarContratosPendientes(usuario.id);
          if (mounted) setContratosPendientes(pendientes);
        }
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
  }, [usuario?.id]);

  const verificarContratosPendientes = async (usuarioId: string): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE}/api/contratos/usuario/${usuarioId}`);
      if (!response.ok) throw new Error('Error al obtener contratos');
      
      const data = await response.json();
      const contratosPendientes = data.data.contratos.pendientes || [];
      return contratosPendientes.length;
    } catch (error) {
      console.error('Error verificando contratos pendientes:', error);
      return 0;
    }
  };

  const handleContratarPlan = async (membresiaId: string) => {
    if (!usuario?.id) {
      alert("Debe estar logueado para contratar un plan");
      return;
    }

    setContratando(membresiaId);
    try {
      // Verificar contratos pendientes antes de contratar
      const contratosPendientes = await verificarContratosPendientes(usuario.id);
      
      if (contratosPendientes >= 2) {
        alert("No puedes contratar más membresías. Ya tienes 2 contratos pendientes de pago. Completa el pago o cancela alguno antes de crear uno nuevo.");
        setContratando(null);
        return;
      }

      // Mostrar advertencia si ya tiene 1 contrato pendiente
      if (contratosPendientes === 1) {
        const continuar = confirm("Ya tienes 1 contrato pendiente de pago. Si continúas, tendrás 2 contratos pendientes (máximo permitido). ¿Deseas continuar?");
        if (!continuar) {
          setContratando(null);
          return;
        }
      }

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
        
        // Actualizar contador de contratos pendientes
        setContratosPendientes(prev => prev + 1);
        
        // Redirigir a la página de contratos o mostrar modal de pago
        if (confirm("¿Desea proceder al pago ahora?")) {
          window.location.href = `/mis-contratos?pagar=${contrato.id}`;
        } else {
          // Si no quiere pagar ahora, ir a la página de contratos
          window.location.href = `/mis-contratos`;
        }
      }
    } catch (error: any) {
      console.error("Error al contratar plan:", error);
      
      // Manejar error específico de límite de contratos
      if (error?.response?.data?.error === 'LIMITE_CONTRATOS_EXCEDIDO') {
        alert(`❌ ${error.response.data.message}\n\n📊 Contratos pendientes: ${error.response.data.contratosPendientesActuales}/${error.response.data.limite}`);
      } else {
        alert(error instanceof Error ? error.message : "Error al contratar el plan");
      }
    } finally {
      setContratando(null);
    }
  };

  return (
    <div className="planes-page">
      <div className="hero"><h1 className="hero-title">PLANES</h1></div>
      
      {/* Mostrar información de contratos pendientes si el usuario está logueado */}
      {usuario && !loading && (
        <div className="contratos-info">
          {contratosPendientes === 0 && (
            <div className="info-card success">
              <span className="info-icon">✅</span>
              <span>No tienes contratos pendientes. Puedes contratar hasta 2 membresías.</span>
            </div>
          )}
          {contratosPendientes === 1 && (
            <div className="info-card warning">
              <span className="info-icon">⚠️</span>
              <span>Tienes 1 contrato pendiente de pago. Puedes contratar 1 membresía más.</span>
            </div>
          )}
          {contratosPendientes >= 2 && (
            <div className="info-card danger">
              <span className="info-icon">❌</span>
              <span>Tienes {contratosPendientes} contratos pendientes. No puedes contratar más hasta completar los pagos.</span>
            </div>
          )}
        </div>
      )}

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
                className={`cta ${contratosPendientes >= 2 ? 'disabled' : ''}`} 
                onClick={() => handleContratarPlan(p.id)}
                disabled={contratando === p.id || contratosPendientes >= 2}
                title={contratosPendientes >= 2 ? 'No puedes contratar más planes. Tienes 2 contratos pendientes.' : ''}
              >
                {contratando === p.id 
                  ? "Contratando..." 
                  : contratosPendientes >= 2 
                    ? "Límite alcanzado" 
                    : "¡Contratar Plan!"
                }
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
