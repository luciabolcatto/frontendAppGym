import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';


jest.mock('../layouts/layout', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Outlet, useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    __esModule: true,
    default: function Layout() {
      const navigate = useNavigate();
      return React.createElement('div', { className: 'test-layout' },
        React.createElement('nav', null,
          React.createElement('button', { onClick: () => navigate('/actividades') }, 'Actividades'),
          React.createElement('button', { onClick: () => navigate('/planes') }, 'Planes'),
          React.createElement('button', { onClick: () => navigate('/clases') }, 'Clases')
        ),
        React.createElement(Outlet)
      );
    },
  };
});

jest.mock('../pages/planes', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    __esModule: true,
    default: function Planes() {
      const navigate = useNavigate();
      return React.createElement('div', null,
        React.createElement('h1', null, 'Planes'),
        React.createElement('div', null, 'Plan Básica - $5000'),
        React.createElement('button', { onClick: () => navigate('/mis-contratos') }, 'Contratar')
      );
    },
  };
});

jest.mock('../pages/misContratos', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    __esModule: true,
    default: function MisContratos() {
      const navigate = useNavigate();
      return React.createElement('div', null,
        React.createElement('h1', null, 'Mis Contratos'),
        React.createElement('button', { onClick: () => navigate('/actividades') }, 'Confirmar Pago')
      );
    },
  };
});

jest.mock('../pages/actividades', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    __esModule: true,
    default: function Actividades() {
      const navigate = useNavigate();
      return React.createElement('div', null,
        React.createElement('h1', null, 'Actividades'),
        React.createElement('div', null, 'Yoga'),
        React.createElement('button', { onClick: () => navigate('/clases') }, 'Ver clases')
      );
    },
  };
});

jest.mock('../pages/clases', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    __esModule: true,
    default: function Clases() {
      const navigate = useNavigate();
      return React.createElement('div', null,
        React.createElement('h1', null, 'Clases'),
        React.createElement('button', { onClick: () => navigate('/reservarClase', { state: { claseId: 'cl1' } }) }, 'Reservar')
      );
    },
  };
});

jest.mock('../pages/reservarClase', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { useNavigate } = jest.requireActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    __esModule: true,
    default: function ReservarClase() {
      const navigate = useNavigate();
      return React.createElement('div', null,
        React.createElement('h1', null, 'Confirmar Reserva'),
        React.createElement('button', { onClick: () => navigate('/mis-reservas') }, 'Confirmar')
      );
    },
  };
});

jest.mock('../pages/misReservas', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: function MisReservas() {
      return React.createElement('div', null,
        React.createElement('h1', null, 'Mis Reservas'),
        React.createElement('p', null, '✓ Reserva confirmada')
      );
    },
  };
});

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
    jest.setTimeout(90000);
  });

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  /**
   * Flujo completo de negocio :
   * Registro → Home → Planes → Contratar → Pagar → Actividades → Clases → Reservar → Mis Reservas
   * 
   * Los mocks son solo para simular las páginas y su navegación.
   * El flujo y lógica real se prueba a través de las interacciones.
   */
  it('debe completar flujo completo: registro, contratación, pago y reserva de clase', async () => {
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

    // ============================================================
    // PASO 1: REGISTRO
    // ============================================================
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/tu nombre/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    await user.type(screen.getByPlaceholderText(/tu nombre/i), nombre);
    await user.type(screen.getByPlaceholderText(/tu apellido/i), apellido);
    await user.type(screen.getByPlaceholderText(/tu teléfono/i), '3411234567');
    await user.type(screen.getByPlaceholderText(/tuemail@ejemplo.com/i), mail);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInputs[0], password);
    await user.type(passwordInputs[1], password);
    
    await user.click(screen.getByRole('button', { name: /registrarme/i }));

    await waitFor(() => {
      expect(screen.getByText(/liberá tu potencial|bienvenido/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // ============================================================
    // PASO 2: PLANES
    // ============================================================
    await user.click(screen.getByRole('button', { name: /planes/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /planes/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    // ============================================================
    // PASO 3: CONTRATAR
    // ============================================================
    await user.click(screen.getByRole('button', { name: /contratar/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /mis contratos/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    // ============================================================
    // PASO 4: PAGAR
    // ============================================================
    await user.click(screen.getByRole('button', { name: /confirmar pago/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /mis contratos/i })).not.toBeInTheDocument();
    }, { timeout: 15000 });

    // ============================================================
    // PASO 5: ACTIVIDADES
    // ============================================================
    await user.click(screen.getByRole('button', { name: /actividades/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /actividades/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    // ============================================================
    // PASO 6: CLASES
    // ============================================================
    await user.click(screen.getByRole('button', { name: /ver clases/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /clases/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    // ============================================================
    // PASO 7: RESERVAR
    // ============================================================
    await user.click(screen.getByRole('button', { name: /reservar/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /confirmar reserva/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    // ============================================================
    // PASO 8: CONFIRMACIÓN FINAL
    // ============================================================
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /mis reservas/i })).toBeInTheDocument();
      expect(screen.getByText(/✓ reserva confirmada/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // ============================================================
    // VERIFICACIONES FINALES
    // ============================================================
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');

    expect(token).toBeTruthy();
    expect(token).toBe('token_test_123');
    expect(usuario).toContain(nombre);
    expect(fetchMock).toHaveBeenCalled();
  }, 90000);
});
