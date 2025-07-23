// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div>
      <nav className="navbar">
        <h2>Fitness Prime</h2>
        <ul>
          <li>
            <Link to="/reserva">Reservar</Link>
          </li>
          <li>
            <Link to="/perfil">Perfil</Link>
          </li>
        </ul>
      </nav>

      <main className="home-content">
        <h1>¡Bienvenida a tu espacio, Lu! 💪</h1>
        <p>Elegí una opción del menú para continuar.</p>
      </main>
    </div>
  );
};

export default Home;
