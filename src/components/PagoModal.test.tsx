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

  it('cambia de metodo de pago y muestra UI correspondiente', async () => {
    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Transferencia');

    // Selecciona transferencia
    fireEvent.click(screen.getByText('Transferencia'));
    expect(await screen.findByText('Datos para la transferencia')).toBeInTheDocument();

    // Cambia a efectivo
    fireEvent.click(screen.getByText('Efectivo'));
    expect(await screen.findByText('Instrucciones')).toBeInTheDocument();
    expect(screen.queryByText('Datos para la transferencia')).not.toBeInTheDocument();

    // Cambia a tarjeta
    fireEvent.click(screen.getByText('Tarjeta'));
    expect(screen.queryByText('Instrucciones')).not.toBeInTheDocument();
  });

  it('muestra datos bancarios completos cuando se selecciona transferencia', async () => {
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

    expect(await screen.findByText('Banco Test')).toBeInTheDocument();
    expect(screen.getByText('Gym SA')).toBeInTheDocument();
    expect(screen.getByText('0000003100000000000001')).toBeInTheDocument();
    expect(screen.getByText('GYM.TEST')).toBeInTheDocument();
  });

  it('no ejecuta onPagoExitoso si la transaccion falla', async () => {
    const onPagoExitoso = jest.fn();
    (StripeService.pagarConEfectivo as jest.Mock).mockRejectedValueOnce(
      new Error('Error del servidor')
    );

    render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={onPagoExitoso}
      />
    );

    await screen.findByText('Efectivo');
    fireEvent.click(screen.getByText('Efectivo'));
    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await screen.findByText(/Error del servidor/);

    expect(onPagoExitoso).not.toHaveBeenCalled();
  });

  it('valida que el comprobante es requerido para transferencia cuando falla sin él', async () => {
    (StripeService.pagarConTransferencia as jest.Mock).mockRejectedValueOnce(
      new Error('Comprobante requerido')
    );

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

    await screen.findByText(/Comprobante requerido/);
    expect(StripeService.pagarConTransferencia).toHaveBeenCalledWith('c1', undefined);
  });

  it('actualiza informacion del contrato cuando prop cambia', async () => {
    const { rerender } = render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(screen.getByText(/Mensual/)).toBeInTheDocument();
    expect(screen.getByText(/10000|10\.000/)).toBeInTheDocument();

    const nuevoContrato = {
      ...contratoBase,
      id: 'c2',
      membresia: {
        id: 'm2',
        nombre: 'Trimestral',
        descripcion: 'Plan trimestral',
        precio: 25000,
        meses: 3,
      },
    };

    rerender(
      <PagoModal
        contrato={nuevoContrato}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    expect(screen.getByText(/Trimestral/)).toBeInTheDocument();
    expect(screen.getByText(/25000|25\.000/)).toBeInTheDocument();
  });

  it('cierra el modal y ejecuta callbacks correctamente en pago exitoso', async () => {
    const onClose = jest.fn();
    const onPagoExitoso = jest.fn();

    (StripeService.pagarConEfectivo as jest.Mock).mockResolvedValueOnce({
      data: {
        contrato: {
          fechaPago: new Date().toISOString(),
          metodoPago: 'efectivo',
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

    await screen.findByText('Efectivo');
    fireEvent.click(screen.getByText('Efectivo'));
    fireEvent.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(onPagoExitoso).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('muestra error especifico si contrato esta cancelado', async () => {
    render(
      <PagoModal
        contrato={{ ...contratoBase, estado: EstadoContrato.CANCELADO }}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    await screen.findByText('Tarjeta');
    
    // Obtener el botón de pago (el segundo botón en el modal footer)
    const botonesPago = screen.getAllByRole('button');
    const botonPago = botonesPago[botonesPago.length - 1]; // Último botón es el de pagar
    fireEvent.click(botonPago);

    await waitFor(() => {
      expect(screen.getByText('Este contrato no puede ser pagado')).toBeInTheDocument();
    });
  });

  it('valida integridad de datos bancarios mostrados', async () => {
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

    const datosBancarios = await screen.findByText(/Datos para la transferencia/);
    expect(datosBancarios).toBeInTheDocument();

    // Verifica que todos los datos están presentes
    const bancoText = screen.getByText('Banco Test');
    const titularText = screen.getByText('Gym SA');
    const cbuText = screen.getByText('0000003100000000000001');
    const aliasText = screen.getByText('GYM.TEST');

    expect(bancoText.closest('[class*="info"]')).toBeInTheDocument();
    expect(titularText.closest('[class*="info"]')).toBeInTheDocument();
    expect(cbuText.closest('[class*="info"]')).toBeInTheDocument();
    expect(aliasText.closest('[class*="info"]')).toBeInTheDocument();
  });

  it('permite pagar multiples contratos sin interferencia de estado anterior', async () => {
    const { rerender } = render(
      <PagoModal
        contrato={contratoBase}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    (StripeService.pagarConEfectivo as jest.Mock).mockResolvedValueOnce({
      data: { contrato: { fechaPago: new Date().toISOString() } },
    });

    await screen.findByText('Efectivo');
    fireEvent.click(screen.getByText('Efectivo'));

    // Los métodos de pago se cargan al abrir
    expect(StripeService.getMetodosPago).toHaveBeenCalledTimes(1);

    // Rerender con nuevo contrato y isOpen=false
    rerender(
      <PagoModal
        contrato={{ ...contratoBase, id: 'c2' }}
        isOpen={false}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    // Rerender nuevamente con isOpen=true
    rerender(
      <PagoModal
        contrato={{ ...contratoBase, id: 'c2' }}
        isOpen={true}
        onClose={jest.fn()}
        onPagoExitoso={jest.fn()}
      />
    );

    // Deberia cargar los métodos nuevamente para el nuevo contrato
    await waitFor(() => {
      expect(StripeService.getMetodosPago).toHaveBeenCalledTimes(2);
    });
  });
});
