import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContratoService } from '../services/contratoService';
import { Contrato, EstadoContrato } from '../types/contrato';
import PagoModal from '../components/PagoModal';
import './misContratos.css';

const MisContratosPage: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratoParaPagar, setContratoParaPagar] = useState<Contrato | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Obtenemos el usuario del localStorage
  const [usuario] = useState(() => {
    const storedUser = localStorage.getItem('usuario');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!usuario?.id) {
      // Si no hay usuario logueado, mostrar mensaje y no cargar contratos
      setError('Debe iniciar sesión para ver sus contratos');
      setLoading(false);
      return;
    }
    
    cargarContratos();
  }, [usuario]);

  // Verificar si hay que abrir modal de pago automáticamente
  useEffect(() => {
    const contratoIdParaPagar = searchParams.get('pagar');
    if (contratoIdParaPagar && contratos.length > 0) {
      const contrato = contratos.find(c => c.id === contratoIdParaPagar);
      if (contrato && contrato.estado === EstadoContrato.PENDIENTE) {
        setContratoParaPagar(contrato);
      }
    }
  }, [contratos, searchParams]);

  const cargarContratos = async () => {
    if (!usuario?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await ContratoService.obtenerContratosPorUsuario(usuario.id);
      
      // El backend devuelve {usuario, resumen, contratos}, necesitamos extraer los contratos
      const responseData = response.data;
      let contratosArray: Contrato[] = [];
      
      if (responseData && typeof responseData === 'object') {
        // Si tiene una propiedad contratos, la usamos
        if (responseData.contratos) {
          const contratos = responseData.contratos;
          
          // Si contratos es un objeto con arrays por estado, los combinamos
          if (typeof contratos === 'object' && !Array.isArray(contratos)) {
            contratosArray = [
              ...(contratos.activos || []),
              ...(contratos.proximos || []),
              ...(contratos.pendientes || []),
              ...(contratos.cancelados || []),
              ...(contratos.vencidos || [])
            ];
          } else if (Array.isArray(contratos)) {
            contratosArray = contratos;
          }
        } 
        // Si responseData es directamente un array
        else if (Array.isArray(responseData)) {
          contratosArray = responseData;
        }
      }
      
      setContratos(contratosArray);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      setError('Error al cargar los contratos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarContrato = async (contratoId: string) => {
    const confirmar = window.confirm(
      '¿Está seguro que desea cancelar este contrato? Esta acción no se puede deshacer.'
    );
    
    if (!confirmar) return;

    setCancelando(contratoId);
    try {
      await ContratoService.cancelarContrato(contratoId);
      alert('Contrato cancelado exitosamente');
      await cargarContratos(); // Recargar la lista
    } catch (error) {
      console.error('Error al cancelar contrato:', error);
      alert(error instanceof Error ? error.message : 'Error al cancelar el contrato');
    } finally {
      setCancelando(null);
    }
  };

  const handlePagoExitoso = async (contratoActualizado: Contrato) => {
    // Actualizar el contrato en la lista
    setContratos(prev => 
      prev.map(c => c.id === contratoActualizado.id ? contratoActualizado : c)
    );
    setContratoParaPagar(null);
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

  const getEstadoClass = (estado: EstadoContrato) => {
    switch (estado) {
      case EstadoContrato.PAGADO:
        return 'estado-pagado';
      case EstadoContrato.PENDIENTE:
        return 'estado-pendiente';
      case EstadoContrato.CANCELADO:
        return 'estado-cancelado';
      case EstadoContrato.VENCIDO:
        return 'estado-vencido';
      default:
        return '';
    }
  };

  const getEstadoTexto = (estado: EstadoContrato) => {
    switch (estado) {
      case EstadoContrato.PAGADO:
        return 'Pagado';
      case EstadoContrato.PENDIENTE:
        return 'Pendiente de Pago';
      case EstadoContrato.CANCELADO:
        return 'Cancelado';
      case EstadoContrato.VENCIDO:
        return 'Vencido';
      default:
        return estado;
    }
  };

  const puedeSerPagado = (contrato: Contrato) => {
    return contrato.estado === EstadoContrato.PENDIENTE;
  };

  const puedeSerCancelado = (contrato: Contrato) => {
    return contrato.estado === EstadoContrato.PENDIENTE || contrato.estado === EstadoContrato.PAGADO;
  };

  if (loading) {
    return (
      <div className="mis-contratos-page">
        <div className="hero">
          <h1 className="hero-title">MIS CONTRATOS</h1>
        </div>
        <div className="loading">Cargando contratos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-contratos-page">
        <div className="hero">
          <h1 className="hero-title">MIS CONTRATOS</h1>
        </div>
        <div className="contratos-container">
          <div className="no-contratos">
            <h3>{error}</h3>
            {error.includes('iniciar sesión') ? (
              <>
                <p>Debe estar logueado para ver sus contratos.</p>
                <a href="/login" className="btn-primary">Iniciar Sesión</a>
              </>
            ) : (
              <>
                <p>Hubo un problema al cargar los contratos.</p>
                <button onClick={cargarContratos} className="btn-primary">Reintentar</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-contratos-page">
      <div className="hero">
        <h1 className="hero-title">MIS CONTRATOS</h1>
      </div>

      <div className="contratos-container">
        {contratos.length === 0 ? (
          <div className="no-contratos">
            <h3>No tienes contratos registrados</h3>
            <p>Visita nuestra sección de planes para contratar una membresía.</p>
            <a href="/planes" className="btn-primary">Ver Planes</a>
          </div>
        ) : (
          <div className="contratos-grid">
            {contratos.map((contrato) => (
              <div key={contrato.id} className="contrato-card">
                <div className="contrato-header">
                  <h3 className="membresia-nombre">{contrato.membresia.nombre}</h3>
                  <span className={`estado-badge ${getEstadoClass(contrato.estado)}`}>
                    {getEstadoTexto(contrato.estado)}
                  </span>
                </div>

                <div className="contrato-details">
                  <div className="detail-item">
                    <label>Descripción:</label>
                    <span>{contrato.membresia.descripcion}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Duración:</label>
                    <span>{contrato.membresia.meses} meses</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Precio:</label>
                    <span className="precio">{formatearPrecio(contrato.membresia.precio)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <label>Vigencia:</label>
                    <span>
                      {formatearFecha(contrato.fecha_hora_ini)} - {formatearFecha(contrato.fecha_hora_fin)}
                    </span>
                  </div>

                  {contrato.fechaPago && (
                    <div className="detail-item">
                      <label>Fecha de Pago:</label>
                      <span>{formatearFecha(contrato.fechaPago)}</span>
                    </div>
                  )}

                  {contrato.metodoPago && (
                    <div className="detail-item">
                      <label>Método de Pago:</label>
                      <span>{contrato.metodoPago}</span>
                    </div>
                  )}

                  {contrato.fechaCancelacion && (
                    <div className="detail-item">
                      <label>Fecha de Cancelación:</label>
                      <span>{formatearFecha(contrato.fechaCancelacion)}</span>
                    </div>
                  )}
                </div>

                <div className="contrato-actions">
                  {puedeSerPagado(contrato) && (
                    <button
                      className="btn-primary"
                      onClick={() => setContratoParaPagar(contrato)}
                    >
                      Pagar Ahora
                    </button>
                  )}
                  
                  {puedeSerCancelado(contrato) && (
                    <button
                      className="btn-danger"
                      onClick={() => handleCancelarContrato(contrato.id)}
                      disabled={cancelando === contrato.id}
                    >
                      {cancelando === contrato.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {contratoParaPagar && (
        <PagoModal
          contrato={contratoParaPagar}
          isOpen={true}
          onClose={() => setContratoParaPagar(null)}
          onPagoExitoso={handlePagoExitoso}
        />
      )}

      {/* Botones de navegación */}
      <div className="navigation-actions">
        <button 
          className="btn-secondary" 
          onClick={() => window.location.href = '/perfil'}
        >
          Volver al Perfil
        </button>
        <button 
          className="btn-primary" 
          onClick={() => window.location.href = '/planes'}
        >
          Ver Planes
        </button>
      </div>
    </div>
  );
};

export default MisContratosPage;