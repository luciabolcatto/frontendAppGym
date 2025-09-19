import React, { useState } from 'react';
import { ContratoService } from '../services/contratoService';
import { Contrato, EstadoContrato } from '../types/contrato';
import './PagoModal.css';

interface PagoModalProps {
  contrato: Contrato;
  isOpen: boolean;
  onClose: () => void;
  onPagoExitoso: (contratoActualizado: Contrato) => void;
}

const METODOS_PAGO = [
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'simulado', label: 'Pago Simulado' }
];

const PagoModal: React.FC<PagoModalProps> = ({ 
  contrato, 
  isOpen, 
  onClose, 
  onPagoExitoso 
}) => {
  const [metodoPago, setMetodoPago] = useState('tarjeta_credito');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePago = async () => {
    if (!contrato || contrato.estado !== EstadoContrato.PENDIENTE) {
      setError('Este contrato no puede ser pagado');
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const response = await ContratoService.simularPago({
        contratoId: contrato.id,
        metodoPago: metodoPago
      });

      if (response.data.contrato) {
        // Mostrar mensaje de éxito
        alert('¡Pago procesado correctamente!');
        
        // Notificar al componente padre
        onPagoExitoso(response.data.contrato);
        onClose();
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setError(error instanceof Error ? error.message : 'Error al procesar el pago. El sistema tiene un 90% de probabilidad de éxito. Inténtelo nuevamente.');
    } finally {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Procesar Pago</h2>
          <button className="close-button" onClick={onClose}>
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

          <div className="pago-form">
            <h3>Método de Pago</h3>
            <div className="form-group">
              <label htmlFor="metodoPago">Seleccione el método de pago:</label>
              <select
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                disabled={procesando}
              >
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="simulacion-info">
              <p>
                <strong>Nota:</strong> Este es un sistema de pago simulado con 90% de probabilidad de éxito.
                En un entorno real, aquí se integraría con una pasarela de pagos.
              </p>
            </div>
          </div>
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
            {procesando ? 'Procesando...' : `Pagar ${formatearPrecio(contrato.membresia.precio)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoModal;