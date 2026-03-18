import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PagoModal from './PagoModal';
import { EstadoContrato, type Contrato } from '../types/contrato';
import { StripeService } from '../services/stripeService';
import toast from 'react-hot-toast';

jest.mock('../services/stripeService', () => ({
  StripeService: {
    getMetodosPago: jest.fn(),
    createCheckoutSession: jest.fn(),
    pagarConTransferencia: jest.fn(),
    pagarConEfectivo: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
  },
}));

const contratoBase: Contrato = {
  id: 'c1',
  fecha_hora_ini: new Date().toISOString(),
  fecha_hora_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  estado: EstadoContrato.PENDIENTE,
  usuario: {
    id: 'u1',
    nombre: 'Juan',
    apellido: 'Perez',
    mail: 'juan@test.com',
  },
  membresia: {
    id: 'm1',
    nombre: 'Mensual',
    descripcion: 'Plan mensual',
    precio: 10000,
    meses: 1,
  },
};

describe('PagoModal', () => {
  const metodosPagoMock = [
    {
      id: 'stripe',
      nombre: 'Tarjeta',
      descripcion: 'Pago con tarjeta',
      icono: 'credit-card',
      requiereRedireccion: true,
    },
    {
      id: 'transferencia_bancaria',
      nombre: 'Transferencia',
      descripcion: 'Pago por transferencia',
      icono: 'bank',
      requiereRedireccion: false,
      datosBancarios: {
        banco: 'Banco Test',
        titular: 'Gym SA',
        cbu: '0000003100000000000001',
        alias: 'GYM.TEST',
      },
    },
    {
      id: 'efectivo',
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      icono: 'cash',
      requiereRedireccion: false,
      instrucciones: 'Pagar en recepcion',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (StripeService.getMetodosPago as jest.Mock).mockResolvedValue({
      data: metodosPagoMock,
    });
  });

  it('no renderiza contenido cuando isOpen es false', () => {
    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={false}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(screen.queryByText('Procesar Pago')).not.toBeInTheDocument();
  });

  it('carga y muestra metodos de pago al abrirse', async () => {
    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(await screen.findByText('Tarjeta')).toBeInTheDocument();
    expect(screen.getByText('Transferencia')).toBeInTheDocument();
    expect(screen.getByText('Efectivo')).toBeInTheDocument();
    expect(StripeService.getMetodosPago).toHaveBeenCalledTimes(1);
  });

  it('muestra error si se intenta pagar un contrato no pendiente', async () => {
    render(
      <PagoModal
        contrato={{ ...contratoBase, estado: EstadoContrato.PAGADO }}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');

    fireEvent.click(screen.getByRole('button', { name: /confirmar pago|pagar/i }));

    await waitFor(() => {
      expect(screen.getByText('Este contrato no puede ser pagado')).toBeInTheDocument();
    });
  });

  it('cierra el modal al hacer click en Cancelar', async () => {
    const onClose = jest.fn();
    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={onClose}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el modal con el boton X y con click en overlay', async () => {
    const onClose = jest.fn();
    const { container } = render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={onClose}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');

    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    const overlay = container.querySelector('.modal-overlay');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('no cierra el modal al hacer click dentro del contenido', async () => {
    const onClose = jest.fn();
    const { container } = render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={onClose}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Procesar Pago');
    const modalContent = container.querySelector('.modal-content');
    expect(modalContent).not.toBeNull();
    fireEvent.click(modalContent as Element);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('procesa pago con transferencia y dispara callbacks', async () => {
    const onPagoExitoso = jest.fn();
    const onClose = jest.fn();
    (StripeService.pagarConTransferencia as jest.Mock).mockResolvedValueOnce({
      data: {
        contrato: {
          fechaPago: new Date().toISOString(),
          metodoPago: 'transferencia_bancaria',
        },
      },
    });

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={onClose}
        onPagoExitoso={onPagoExitoso}
      />
    );

    await screen.findByText('Transferencia');
    fireEvent.click(screen.getByText('Transferencia'));

    expect(await screen.findByText('Datos para la transferencia')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/número de comprobante/i), {
      target: { value: 'TRF-12345' },
    });

    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(StripeService.pagarConTransferencia).toHaveBeenCalledWith('c1', 'TRF-12345');
      expect(onPagoExitoso).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('procesa transferencia sin comprobante cuando el input esta vacio', async () => {
    (StripeService.pagarConTransferencia as jest.Mock).mockResolvedValueOnce({
      data: {
        contrato: {
          fechaPago: new Date().toISOString(),
          metodoPago: 'transferencia_bancaria',
        },
      },
    });

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Transferencia');
    fireEvent.click(screen.getByText('Transferencia'));
    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(StripeService.pagarConTransferencia).toHaveBeenCalledWith('c1', undefined);
    });
  });

  it('procesa pago en efectivo y muestra instrucciones', async () => {
    const onPagoExitoso = jest.fn();
    const onClose = jest.fn();
    (StripeService.pagarConEfectivo as jest.Mock).mockResolvedValueOnce({
      data: {
        contrato: {
          fechaPago: new Date().toISOString(),
          metodoPago: 'efectivo',
        },
        reciboNumero: 'REC-1001',
      },
    });

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={onClose}
        onPagoExitoso={onPagoExitoso}
      />
    );

    await screen.findByText('Efectivo');
    fireEvent.click(screen.getByText('Efectivo'));

    expect(await screen.findByText('Instrucciones')).toBeInTheDocument();
    expect(screen.getByText('Pagar en recepcion')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(StripeService.pagarConEfectivo).toHaveBeenCalledWith('c1');
      expect(onPagoExitoso).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('inicia flujo de pago con Stripe y muestra redireccion', async () => {
    (StripeService.createCheckoutSession as jest.Mock).mockResolvedValueOnce({
      checkoutUrl: 'https://checkout.stripe.com/test',
    });

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');
    fireEvent.click(screen.getByText('Tarjeta'));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => {
      expect(StripeService.createCheckoutSession).toHaveBeenCalledWith('c1');
      expect(screen.getByText(/redirigiendo a stripe/i)).toBeInTheDocument();
    });
  });

  it('muestra error si Stripe no devuelve checkoutUrl', async () => {
    (StripeService.createCheckoutSession as jest.Mock).mockResolvedValueOnce({});

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => {
      expect(screen.getByText('No se recibió la URL de pago')).toBeInTheDocument();
    });
  });

  it('muestra error cuando el metodo seleccionado no esta soportado', async () => {
    (StripeService.getMetodosPago as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          id: 'crypto',
          nombre: 'Crypto',
          descripcion: 'Pago con crypto',
          icono: 'coin',
          requiereRedireccion: false,
        },
      ],
    });

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Crypto');
    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(screen.getByText('Método de pago no soportado: Crypto')).toBeInTheDocument();
    });
  });

  it('muestra error si falla cargar metodos de pago', async () => {
    (StripeService.getMetodosPago as jest.Mock).mockRejectedValueOnce(new Error('fallo carga'));

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(await screen.findByText('Error al cargar los métodos de pago disponibles')).toBeInTheDocument();
  });

  it('permite reintentar y muestra error por metodo no seleccionado cuando no hay metodos', async () => {
    (StripeService.getMetodosPago as jest.Mock).mockRejectedValueOnce(new Error('fallo carga'));

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(await screen.findByText('Error al cargar los métodos de pago disponibles')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText('Por favor, selecciona un método de pago')).toBeInTheDocument();
    });
  });
});
