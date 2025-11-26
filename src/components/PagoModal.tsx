import React, { useState } from 'react';
import { StripeService } from '../services/stripeService';
import { Contrato, EstadoContrato } from '../types/contrato';
import './PagoModal.css';

interface PagoModalProps {
  contrato: Contrato;
  isOpen: boolean;
  onClose: () => void;
  onPagoExitoso: (contratoActualizado: Contrato) => void;
}

const PagoModal: React.FC<PagoModalProps> = ({ 
  contrato, 
  isOpen, 
  onClose, 
}) => {
  const [procesando, setProcesando] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePago = async () => {
    if (!contrato || contrato.estado !== EstadoContrato.PENDIENTE) {
      setError('Este contrato no puede ser pagado');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const response = await StripeService.createCheckoutSession(contrato.id);

      if (response.checkoutUrl) {
        // Mostrar estado de redirección antes de navegar
        setRedirecting(true);
        
        // Pequeña pausa para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = response.checkoutUrl;
        }, 500);
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (error) {
      console.error('Error al crear sesión de pago:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Error al conectar con el servicio de pagos. Por favor, inténtelo nuevamente.'
      );
      setProcesando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearPrecio = (precio: number) => {
    return precio.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    });
  };

  if (!isOpen) return null;

  // Estado de redirección a Stripe
  if (redirecting) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="redirecting-state">
            <div className="spinner"></div>
            <h3>Redirigiendo a Stripe...</h3>
            <p>Serás llevado a la página de pago seguro</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Procesar Pago</h2>
          <button className="close-button" onClick={onClose} disabled={procesando}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="contrato-info">
            <h3>Detalles del Contrato</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Membresía:</label>
                <span>{contrato.membresia.nombre}</span>
              </div>
              <div className="info-item">
                <label>Descripción:</label>
                <span>{contrato.membresia.descripcion}</span>
              </div>
              <div className="info-item">
                <label>Duración:</label>
                <span>{contrato.membresia.meses} meses</span>
              </div>
              <div className="info-item">
                <label>Vigencia:</label>
                <span>
                  {formatearFecha(contrato.fecha_hora_ini)} - {formatearFecha(contrato.fecha_hora_fin)}
                </span>
              </div>
              <div className="info-item precio-destacado">
                <label>Precio:</label>
                <span>{formatearPrecio(contrato.membresia.precio)}</span>
              </div>
            </div>
          </div>

          <div className="stripe-info">
            <div className="stripe-badge">
              <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" width="60" height="25">
                <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-3.67-3.14c0-1.53-.64-3.06-2.24-3.06-1.53 0-2.27 1.54-2.27 3.06h4.51zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.1 1.03a4.23 4.23 0 0 1 3.34-1.44c2.97 0 5.43 2.64 5.43 7.21s-2.57 7.93-5.59 7.93zm-.84-11.78c-.88 0-1.45.27-1.85.74v5.83c.4.45.94.72 1.85.72 1.53 0 2.47-1.57 2.47-3.65 0-2.06-.91-3.64-2.47-3.64zM25.7 5.1c-1.56 0-2.64.7-3.26 1.42l-.1-1.04h-3.75v14.8h4.12V9.66c.4-.53.99-.8 1.76-.8.5 0 .99.09 1.54.26l.4-3.8c-.44-.11-.96-.22-1.71-.22zM18.8 5.57v14.72h-4.12V5.57h4.12zm-2.06-5.5a2.37 2.37 0 1 1 0 4.74 2.37 2.37 0 0 1 0-4.74zM9.68 14.08v6.21H5.56V5.57h3.75l.1 1.04c.63-.8 1.8-1.44 3.43-1.44v3.89c-.84-.16-2.12 0-2.83.46-.13.08-.23.22-.33.46v4.1z"></path>
              </svg>
              <span>Pago seguro con Stripe</span>
            </div>
            <p>
              Al continuar, serás redirigido a la página de pago seguro de Stripe 
              para completar tu transacción.
            </p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="btn-retry" 
                onClick={handlePago}
                disabled={procesando}
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handlePago}
            disabled={procesando}
          >
            {procesando ? (
              <>
                <span className="btn-spinner"></span>
                Conectando...
              </>
            ) : (
              `Pagar ${formatearPrecio(contrato.membresia.precio)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoModal;