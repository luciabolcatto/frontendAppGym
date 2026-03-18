import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../layouts/layout', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { Outlet, useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockLayout() {
      const navigate = useNavigate();
      return ReactLocal.createElement(
        'div',
        null,
        ReactLocal.createElement('button', { onClick: () => navigate('/actividades') }, 'Actividades'),
        ReactLocal.createElement('button', { onClick: () => navigate('/clases') }, 'Clases'),
        ReactLocal.createElement('button', { onClick: () => navigate('/planes') }, 'Planes'),
        ReactLocal.createElement(Outlet)
      );
    },
  };
});

jest.mock('../pages/perfil', () => ({
  __esModule: true,
  default: () => <h1>Perfil</h1>,
}));

jest.mock('../pages/actividades', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockActividades() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>ACTIVIDADES</h1>
          <button onClick={() => navigate('/clases')}>Ver clases de Yoga</button>
        </div>
      );
    },
  };
});

jest.mock('../pages/planes', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockPlanes() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>PLANES</h1>
          <button onClick={() => navigate('/mis-contratos')}>Contratar Plan</button>
        </div>
      );
    },
  };
});

jest.mock('../pages/misContratos', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockMisContratos() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>MIS CONTRATOS</h1>
          <h2>Procesar Pago</h2>
          <button onClick={() => navigate('/actividades')}>Confirmar Pago</button>
        </div>
      );
    },
  };
});

jest.mock('../pages/cambiarContrasena', () => ({
  __esModule: true,
  default: () => <h1>Cambiar contrasena</h1>,
}));

jest.mock('../pages/clases', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockClases() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>CLASES</h1>
          <button onClick={() => navigate('/reservarClase', { state: { claseId: 'cl1', claseNombre: 'Yoga' } })}>
            Reservar Yoga
          </button>
        </div>
      );
    },
  };
});

jest.mock('../pages/reservarClase', () => {
  const ReactLocal = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function MockReservarClase() {
      const navigate = useNavigate();
      return (
        <div>
          <h1>Confirmar Reserva</h1>
          <button onClick={() => navigate('/mis-reservas')}>Confirmar Reserva</button>
        </div>
      );
    },
  };
});

jest.mock('../pages/misReservas', () => ({
  __esModule: true,
  default: () => <h1>MIS RESERVAS</h1>,
}));

jest.mock('../pages/olvideMiContrasena', () => ({
  __esModule: true,
  default: () => <h1>Olvide mi contrasena</h1>,
}));

jest.mock('../pages/restablecerContrasena', () => ({
  __esModule: true,
  default: () => <h1>Restablecer contrasena</h1>,
}));

import App from '../App';

const API_BASE = 'http://localhost:5500';
const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('E2E Frontend - Flujo completo usuario', () => {
  beforeAll(() => {
    jest.setTimeout(120000);
  });

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('debe completar registro, contratar, pagar y reservar clase', async () => {
    const unique = Date.now();
    const nombre = 'E2E';
    const apellido = `User${unique}`;
    const mail = `e2e_${unique}@mail.com`;
    const password = '123456';

    const userId = 'u1';
    const contratoId = 'c1';
    const claseId = 'cl1';
    const actividadId = 'a1';
    const now = Date.now();
    const claseInicio = new Date(now + 2 * 60 * 60 * 1000).toISOString();
    const claseFin = new Date(now + 3 * 60 * 60 * 1000).toISOString();

    let contratoEstado: 'pendiente' | 'pagado' = 'pendiente';
    let contratoExiste = false;
    let reservaCreada = false;
    let cupoDisp = 3;

    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();

      if (url === `${API_BASE}/api/Usuarios/` && method === 'POST') {
        return jsonResponse({ message: 'Usuario creado', data: { id: userId } }, 201);
      }

      if (url === `${API_BASE}/api/Usuarios/login` && method === 'POST') {
        return jsonResponse({ token: 'token_test_123', usuario: { id: userId } });
      }

      if (url === `${API_BASE}/api/Usuarios/${userId}` && method === 'GET') {
        return jsonResponse({
          data: {
            id: userId,
            nombre,
            apellido,
            mail,
            tel: '3411234567',
          },
        });
      }

      if (url === `${API_BASE}/api/membresias` && method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: 'm1',
              nombre: 'Básica',
              descripcion: 'Plan básico',
              precio: 5000,
              meses: 1,
            },
          ],
        });
      }

      if (url === `${API_BASE}/api/contratos/contratar` && method === 'POST') {
        contratoExiste = true;
        contratoEstado = 'pendiente';
        return jsonResponse(
          {
            data: {
              contrato: {
                id: contratoId,
                estado: 'pendiente',
                fecha_hora_ini: new Date(now).toISOString(),
                fecha_hora_fin: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
                membresia: {
                  id: 'm1',
                  nombre: 'Básica',
                  descripcion: 'Plan básico',
                  precio: 5000,
                  meses: 1,
                },
              },
              esRenovacion: false,
            },
          },
          201
        );
      }

      if (url === `${API_BASE}/api/contratos/usuario/${userId}` && method === 'GET') {
        if (!contratoExiste) {
          return jsonResponse({
            data: {
              contratos: {
                activos: [],
                proximos: [],
                pendientes: [],
                cancelados: [],
                vencidos: [],
              },
            },
          });
        }

        const contrato = {
          id: contratoId,
          estado: contratoEstado,
          fecha_hora_ini: new Date(now).toISOString(),
          fecha_hora_fin: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
          membresia: {
            id: 'm1',
            nombre: 'Básica',
            descripcion: 'Plan básico',
            precio: 5000,
            meses: 1,
          },
        };

        return jsonResponse({
          data: {
            contratos: {
              activos: contratoEstado === 'pagado' ? [contrato] : [],
              proximos: [],
              pendientes: contratoEstado === 'pendiente' ? [contrato] : [],
              cancelados: [],
              vencidos: [],
            },
          },
        });
      }

      if (url === `${API_BASE}/api/stripe/metodos-pago` && method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: 'stripe',
              nombre: 'Tarjeta de Crédito/Débito',
              descripcion: 'Pago con Stripe',
              requiereRedireccion: true,
            },
            {
              id: 'efectivo',
              nombre: 'Efectivo',
              descripcion: 'Pago en efectivo en recepción del gimnasio',
              requiereRedireccion: false,
              instrucciones: 'Pago en recepción',
            },
          ],
        });
      }

      if (url === `${API_BASE}/api/stripe/pagar-efectivo` && method === 'POST') {
        contratoEstado = 'pagado';
        return jsonResponse({
          data: {
            contrato: {
              id: contratoId,
              estado: 'pagado',
              fechaPago: new Date().toISOString(),
              metodoPago: 'efectivo',
            },
            reciboNumero: 'REC-1001',
          },
        });
      }

      if (url === `${API_BASE}/api/actividad` && method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: actividadId,
              nombre: 'Yoga',
              descripcion: 'Clase de Yoga',
              imagenUrl: '/public/uploads/actividad/yoga.jpg',
            },
          ],
        });
      }

      if (url.includes(`${API_BASE}/api/clases/con-reservas-usuario`) && method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: claseId,
              fecha_hora_ini: claseInicio,
              fecha_hora_fin: claseFin,
              cupo_disp: cupoDisp,
              actividad: {
                id: actividadId,
                nombre: 'Yoga',
                descripcion: 'Clase de Yoga',
              },
              entrenador: {
                id: 'e1',
                nombre: 'Ana',
                apellido: 'Ruiz',
              },
              reservas: [],
            },
          ],
        });
      }

      if (url === `${API_BASE}/api/clases/${claseId}` && method === 'GET') {
        return jsonResponse({
          data: {
            id: claseId,
            fecha_hora_ini: claseInicio,
            fecha_hora_fin: claseFin,
            cupo_disp: cupoDisp,
          },
        });
      }

      if (url === `${API_BASE}/api/Reservas` && method === 'POST') {
        reservaCreada = true;
        return jsonResponse({ message: 'reserva creada', data: { id: 'r1' } }, 201);
      }

      if (url === `${API_BASE}/api/clases/${claseId}/actualizar-cupo` && method === 'PATCH') {
        cupoDisp = Math.max(0, cupoDisp - 1);
        return jsonResponse({ message: 'cupo actualizado' });
      }

      if (url.includes(`${API_BASE}/api/Reservas?usuario=${userId}`) && method === 'GET') {
        return jsonResponse({
          data: reservaCreada
            ? [
                {
                  id: 'r1',
                  fecha_hora: new Date().toISOString(),
                  estado: 'pendiente',
                  clase: {
                    id: claseId,
                    fecha_hora_ini: claseInicio,
                    fecha_hora_fin: claseFin,
                    cupo_disp: cupoDisp,
                    actividad: {
                      id: actividadId,
                      nombre: 'Yoga',
                      descripcion: 'Clase de Yoga',
                    },
                    entrenador: {
                      id: 'e1',
                      nombre: 'Ana',
                      apellido: 'Ruiz',
                    },
                  },
                },
              ]
            : [],
        });
      }

      return jsonResponse({ message: `endpoint no mockeado: ${method} ${url}` }, 404);
    });

    globalThis.fetch = fetchMock as typeof fetch;

    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/tu nombre/i), nombre);
    await user.type(screen.getByPlaceholderText(/tu apellido/i), apellido);
    await user.type(screen.getByPlaceholderText(/tu teléfono/i), '3411234567');
    await user.type(screen.getByPlaceholderText(/tuemail@ejemplo.com/i), mail);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInputs[0], password);
    await user.type(passwordInputs[1], password);
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /liberá tu potencial/i })).toBeInTheDocument();
    }, { timeout: 30000 });

    await user.click(screen.getByRole('button', { name: /^planes$/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /planes/i })).toBeInTheDocument();
    }, { timeout: 20000 });

    const contratarBtn = await screen.findByRole('button', { name: /contratar plan/i }, { timeout: 30000 });
    await user.click(contratarBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /mis contratos/i })).toBeInTheDocument();
    }, { timeout: 30000 });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /procesar pago/i })).toBeInTheDocument();
    }, { timeout: 20000 });

    await user.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /procesar pago/i })).not.toBeInTheDocument();
    }, { timeout: 30000 });

    await user.click(screen.getByRole('button', { name: /^actividades$/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^actividades$/i })).toBeInTheDocument();
    }, { timeout: 20000 });

    await user.click(screen.getByRole('button', { name: /ver clases de yoga/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^clases$/i })).toBeInTheDocument();
    }, { timeout: 20000 });

    await user.click(await screen.findByRole('button', { name: /reservar yoga/i }, { timeout: 30000 }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /confirmar reserva/i })).toBeInTheDocument();
    }, { timeout: 20000 });

    await user.click(screen.getByRole('button', { name: /confirmar reserva/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /mis reservas/i })).toBeInTheDocument();
    }, { timeout: 30000 });

    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    expect(token).toBeTruthy();
    expect(usuario).toContain(nombre);
    expect(fetchMock).toHaveBeenCalled();
  }, 120000);
});
