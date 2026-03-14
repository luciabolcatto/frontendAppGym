import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { StripeService } from '../services/stripeService';
import { Contrato, EstadoContrato } from '../types/contrato';
import { MetodoPago } from '../types/stripe';
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
  onPagoExitoso,
}) => {
  const [procesando, setProcesando] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [cargandoMetodos, setCargandoMetodos] = useState(false);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [comprobanteNumero, setComprobanteNumero] = useState('');

  // Cargar métodos de pago al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarMetodosPago();
    } else {
      // Reset state when modal closes
      setMetodoSeleccionado(null);
      setComprobanteNumero('');
      setError(null);
      setProcesando(false);
      setRedirecting(false);
    }
  }, [isOpen]);

  const cargarMetodosPago = async () => {
    setCargandoMetodos(true);
    setError(null);
    try {
      const response = await StripeService.getMetodosPago();
      setMetodosPago(response.data);
      // Seleccionar el primer método por defecto
      if (response.data.length > 0) {
        setMetodoSeleccionado(response.data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError('Error al cargar los métodos de pago disponibles');
    } finally {
      setCargandoMetodos(false);
    }
  };

  const handlePago = async () => {
    if (!contrato || contrato.estado !== EstadoContrato.PENDIENTE) {
      setError('Este contrato no puede ser pagado');
      return;
    }

    if (!metodoSeleccionado) {
      setError('Por favor, selecciona un método de pago');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const metodo = metodosPago.find(m => m.id === metodoSeleccionado);
      
      if (metodoSeleccionado === 'stripe') {
        // Pago con tarjeta via Stripe Checkout
        const response = await StripeService.createCheckoutSession(contrato.id);

        if (response.checkoutUrl) {
          setRedirecting(true);
          setTimeout(() => {
            window.location.href = response.checkoutUrl;
          }, 500);
        } else {
          throw new Error('No se recibió la URL de pago');
        }
      } else if (metodoSeleccionado === 'transferencia_bancaria') {
        // Pago con transferencia bancaria
        const response = await StripeService.pagarConTransferencia(
          contrato.id, 
          comprobanteNumero || undefined
        );
        
        // Actualizar contrato con los nuevos datos
        const contratoActualizado: Contrato = {
          ...contrato,
          estado: EstadoContrato.PAGADO,
          fechaPago: response.data.contrato.fechaPago,
          metodoPago: response.data.contrato.metodoPago,
        };
        
        toast.success('¡Pago con transferencia registrado exitosamente!');
        onPagoExitoso(contratoActualizado);
        onClose();
      } else if (metodoSeleccionado === 'efectivo') {
        // Pago en efectivo
        const response = await StripeService.pagarConEfectivo(contrato.id);
        
        // Actualizar contrato con los nuevos datos
        const contratoActualizado: Contrato = {
          ...contrato,
          estado: EstadoContrato.PAGADO,
          fechaPago: response.data.contrato.fechaPago,
          metodoPago: response.data.contrato.metodoPago,
        };
        
        toast.success(`¡Pago en efectivo registrado! Recibo: ${response.data.reciboNumero}`);
        onPagoExitoso(contratoActualizado);
        onClose();
      } else {
        throw new Error(`Método de pago no soportado: ${metodo?.nombre || metodoSeleccionado}`);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Error al procesar el pago. Por favor, inténtelo nuevamente.'
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

  const getMetodoSeleccionadoData = (): MetodoPago | undefined => {
    return metodosPago.find(m => m.id === metodoSeleccionado);
  };

  const getBotonTexto = (): string => {
    if (procesando) {
      if (metodoSeleccionado === 'stripe') return 'Conectando...';
      return 'Procesando...';
    }
    
    const metodo = getMetodoSeleccionadoData();
    if (metodo?.requiereRedireccion) {
      return `Pagar ${formatearPrecio(contrato.membresia.precio)}`;
    }
    return `Confirmar Pago ${formatearPrecio(contrato.membresia.precio)}`;
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
            </div>
          </div>

          {/* Selector de método de pago */}
          <div className="metodo-pago-section">
            <h3>Método de Pago</h3>
            
            {cargandoMetodos ? (
              <div className="metodos-loading">
                <div className="spinner-small"></div>
                <span>Cargando métodos de pago...</span>
              </div>
            ) : (
              <div className="metodo-pago-selector">
                {metodosPago.map((metodo) => (
                  <div
                    key={metodo.id}
                    className={`metodo-option ${metodoSeleccionado === metodo.id ? 'selected' : ''}`}
                    onClick={() => !procesando && setMetodoSeleccionado(metodo.id)}
                  >
                    <div className="metodo-option-header">
                      <span className="metodo-nombre">{metodo.nombre}</span>
                      {metodoSeleccionado === metodo.id && (
                        <span className="metodo-check">✓</span>
                      )}
                    </div>
                    <span className="metodo-descripcion">{metodo.descripcion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información adicional según método seleccionado */}
          {metodoSeleccionado === 'stripe' && (
            <div className="stripe-info">
              <div className="stripe-badge">
                <svg className="stripe-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 222.5" width="60" height="28">
                  <path fill="#635BFF" d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7z"/>
                </svg>
                <span>Pago seguro con Stripe</span>
              </div>
              <p>
                Al continuar, serás redirigido a la página de pago seguro de Stripe 
                para completar tu transacción.
              </p>
            </div>
          )}

          {metodoSeleccionado === 'transferencia_bancaria' && (
            <div className="transferencia-info">
              {(() => {
                const metodo = getMetodoSeleccionadoData();
                const datos = metodo?.datosBancarios;
                return datos ? (
                  <>
                    <div className="datos-bancarios">
                      <h4>Datos para la transferencia</h4>
                      <div className="datos-bancarios-grid">
                        <div className="dato-item">
                          <label>Banco:</label>
                          <span>{datos.banco}</span>
                        </div>
                        <div className="dato-item">
                          <label>Titular:</label>
                          <span>{datos.titular}</span>
                        </div>
                        <div className="dato-item">
                          <label>CBU:</label>
                          <span className="dato-copiable">{datos.cbu}</span>
                        </div>
                        <div className="dato-item">
                          <label>Alias:</label>
                          <span className="dato-copiable">{datos.alias}</span>
                        </div>
                      </div>
                    </div>
                    <div className="comprobante-input">
                      <label htmlFor="comprobante">Número de comprobante (opcional)</label>
                      <input
                        type="text"
                        id="comprobante"
                        value={comprobanteNumero}
                        onChange={(e) => setComprobanteNumero(e.target.value)}
                        placeholder="Ej: TRF-123456789"
                        disabled={procesando}
                      />
                      <small>Ingresa el número de comprobante para agilizar la verificación</small>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          {metodoSeleccionado === 'efectivo' && (
            <div className="efectivo-info">
              {(() => {
                const metodo = getMetodoSeleccionadoData();
                return metodo?.instrucciones ? (
                  <div className="instrucciones-efectivo">
                    <h4>Instrucciones</h4>
                    <p>{metodo.instrucciones}</p>
                    <div className="nota-efectivo">
                      <strong>Nota:</strong> Al confirmar, se registrará tu intención de pago 
                      y el contrato quedará marcado como pagado.
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

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
            disabled={procesando || cargandoMetodos || !metodoSeleccionado}
          >
            {procesando ? (
              <>
                <span className="btn-spinner"></span>
                {getBotonTexto()}
              </>
            ) : (
              getBotonTexto()
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoModal;