import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./planes.css";
import { Membresia } from "../types/membresia";
import { ContratoService, MembresiaService } from "../services/contratoService";
import { ContratoRequest } from "../types/contrato";
import { buildApiUrl } from '../shared/config';

const currency = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PlanesPage: React.FC = () => {
  const [items, setItems] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratando, setContratando] = useState<string | null>(null);
  const [contratosPendientes, setContratosPendientes] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean; membresiaId: string | null; message: string }>({ show: false, membresiaId: null, message: '' });
  const navigate = useNavigate();
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
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/contratos/usuario/${usuarioId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      toast.error("Debe iniciar sesión para contratar un plan");
      navigate('/login');
      return;
    }

    setContratando(membresiaId);
    try {
      // Verificar contratos pendientes antes de contratar
      const pendientes = await verificarContratosPendientes(usuario.id);
      
      if (pendientes >= 2) {
        toast.error("Ya tienes 2 contratos pendientes. Completa los pagos o cancela alguno antes de contratar otro.");
        setContratando(null);
        return;
      }

      // Mostrar advertencia si ya tiene 1 contrato pendiente
      if (pendientes === 1) {
        setShowConfirmModal({
          show: true,
          membresiaId,
          message: 'Ya tienes 1 contrato pendiente de pago. Si continúas, tendrás 2 contratos pendientes (máximo permitido).'
        });
        setContratando(null);
        return;
      }

      await procesarContratacion(membresiaId);
    } catch (error: any) {
      console.error("Error al contratar plan:", error);
      toast.error(error instanceof Error ? error.message : "Error al contratar el plan");
    } finally {
      setContratando(null);
    }
  };

  const procesarContratacion = async (membresiaId: string) => {
    const request: ContratoRequest = {
      usuarioId: usuario.id,
      membresiaId: membresiaId
    };

    const response = await ContratoService.contratarMembresia(request);
    
    if (response.data.contrato) {
      const { contrato, esRenovacion } = response.data;
      
      // Actualizar contador de contratos pendientes
      setContratosPendientes(prev => prev + 1);
      
      if (esRenovacion) {
        toast.success(`¡Renovación programada! Comenzará el ${new Date(contrato.fecha_hora_ini).toLocaleDateString()}`);
      } else {
        toast.success('¡Contrato creado exitosamente!');
      }
      
      // Redirigir directamente a mis-contratos con el parámetro para abrir el modal de pago
      navigate(`/mis-contratos?pagar=${contrato.id}`);
    }
  };

  const handleConfirmContratacion = async () => {
    if (showConfirmModal.membresiaId) {
      setShowConfirmModal({ show: false, membresiaId: null, message: '' });
      setContratando(showConfirmModal.membresiaId);
      try {
        await procesarContratacion(showConfirmModal.membresiaId);
      } catch (error: any) {
        toast.error(error instanceof Error ? error.message : "Error al contratar el plan");
      } finally {
        setContratando(null);
      }
    }
  };

  return (
    <div className="planes-page">
      <div className="hero">
        <h1 className="hero-title">PLANES</h1>
      </div>
      {usuario && (
        <div className="hero-button-section">
          <button 
            className="btn-secondary" 
            onClick={() => window.location.href = '/mis-contratos'}
          >
            Mis Contratos
          </button>
        </div>
      )}
      
      {/* Mostrar información de contratos pendientes si el usuario está logueado */}
      {usuario && !loading && (
        <div className="contratos-info">
          {contratosPendientes === 0 && (
            <div className="info-card success">
              <span className="info-icon"></span>
              <span>No tienes contratos pendientes. Puedes contratar hasta 2 membresías.</span>
            </div>
          )}
          {contratosPendientes === 1 && (
            <div className="info-card warning">
              <span className="info-icon"></span>
              <span>Tienes 1 contrato pendiente de pago. Puedes contratar 1 membresía más.</span>
            </div>
          )}
          {contratosPendientes >= 2 && (
            <div className="info-card danger">
              <span className="info-icon"></span>
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

      {/* Modal de confirmación personalizado */}
      {showConfirmModal.show && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">⚠️</div>
            <h3>Confirmar contratación</h3>
            <p>{showConfirmModal.message}</p>
            <p className="confirm-question">¿Deseas continuar?</p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal({ show: false, membresiaId: null, message: '' })}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmContratacion}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesPage;
