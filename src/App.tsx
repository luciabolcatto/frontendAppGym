import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/layout';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Perfil from './pages/perfil';
import Reserva from './pages/reservas';
import ActividadesPage from './pages/actividades';
import ConocenosPage from './pages/conocenos';
import PlanesPage from './pages/planes';
import MisContratosPage from './pages/misContratos';
import CambiarContrasena from './pages/cambiarContrasena';
import BorrarCuenta from './pages/borrarCuenta';
import ClasesPage from './pages/clases';
import AdminLogin from './pages/adminLogin';
import AdminMenu from './pages/adminMenu';
import UsuariosPorEstado from './pages/usuariosPorEstado';
import ReservasPorClase1 from './pages/reservasPorClase1';
import ReservasPorClase2 from './pages/reservasPorClase2';
import ReservarClase from './pages/reservarClase';

function App(): React.JSX.Element {
  return (
    <Routes>
      {/* Todas las rutas usan Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} /> {/* / */}
        <Route path="home" element={<Home />} /> {/* /home */}
        <Route path="perfil" element={<Perfil />} />
        <Route path="reserva" element={<Reserva />} />
        <Route path="planes" element={<PlanesPage />} />
        <Route path="mis-contratos" element={<MisContratosPage />} />
        <Route path="actividades" element={<ActividadesPage />} />
        <Route path="conocenos" element={<ConocenosPage />} />
        <Route path="cambiarContrasena" element={<CambiarContrasena />} />
        <Route path="borrarCuenta" element={<BorrarCuenta />} />
        <Route path="clases" element={<ClasesPage />} />
        <Route path="reservarClase" element={<ReservarClase />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminMenu />} />
      <Route
        path="/admin/usuarios-por-estado"
        element={<UsuariosPorEstado />}
      />
      <Route path="/admin/informe-reservas" element={<ReservasPorClase1 />} />
      <Route
        path="/admin/informe-reservas/clase/:claseId"
        element={<ReservasPorClase2 />}
      />
    </Routes>
  );
}

export default App;
