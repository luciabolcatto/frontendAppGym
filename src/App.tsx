import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import Perfil from './pages/perfil';
import Reserva from './pages/reservas';
import ActividadesPage from './pages/actividades';

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/reserva" element={<Reserva />} />
      <Route path="/actividades" element={<ActividadesPage />} />
    </Routes>
  );
}

export default App;
