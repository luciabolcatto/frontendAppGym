import React from 'react';
import './landing.css';
import { useNavigate } from 'react-router-dom';
import paginainicio from '../assets/paginainicio.jpg';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">FITNESS PRIME</div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/login')}>Iniciar sesión</button>
          <button>Conócenos</button>
        </div>
      </nav>

      <div className="main-content">
        <img src={paginainicio} alt="Gym" className="hero-image" />
        <div className="text-content">
          <h1>LIBERÁ TU POTENCIAL</h1>
          <p>Unite a nosotros y sentí la diferencia</p>
        </div>
      </div>
    </div>
  );
}
