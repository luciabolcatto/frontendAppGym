export enum EstadoContrato {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  CANCELADO = 'cancelado',
  VENCIDO = 'vencido'
}

export interface Contrato {
  id: string;
  fecha_hora_ini: string; // ISO string
  fecha_hora_fin: string; // ISO string
  estado: EstadoContrato;
  fechaPago?: string; // ISO string
  fechaCancelacion?: string; // ISO string
  metodoPago?: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    mail: string;
  };
  membresia: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    meses: number;
  };
}

export interface ContratoRequest {
  usuarioId: string;
  membresiaId: string;
}

export interface PagoRequest {
  contratoId: string;
  metodoPago?: string;
}

export interface ContratoResponse {
  message: string;
  data: {
    contrato: Contrato;
    fechaInicio?: string;
    fechaFin?: string;
    precio?: number;
    estadoPago?: string;
    esRenovacion?: boolean;
    contratoAnterior?: {
      id: string;
      fechaFin: string;
    };
    metodoPago?: string;
    fechaPago?: string;
    monto?: number;
    vigenciaDesde?: string;
    vigenciaHasta?: string;
    fechaCancelacion?: string;
    estadoAnterior?: string;
  };
}