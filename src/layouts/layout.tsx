import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './layout.css';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';

export default function Layout(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav
        className="navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: '#00bfff' }}>
            FITNESS PRIME
          </Link>
        </div>

        <div
          className="nav-left"
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <button onClick={() => navigate('/actividades')}>Actividades</button>
          <button onClick={() => navigate('/clases')}>Clases</button>
          <button onClick={() => navigate('/conocenos')}>Conócenos</button>
          <button onClick={() => navigate('/planes')}>Planes</button>
          <button onClick={() => navigate('/login')}>Iniciar sesión</button>
        </div>
      </nav>

      {/* Página actual */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <h2>FITNESS PRIME</h2>
          <p>Zeballos 1341 - Rosario, Argentina</p>
          <p>Email: fitnessprime@gmail.com</p>
          <p>Tel: +54 341 456-7890</p>
          <p>Horario: Lunes a Sábado de 7:00 a 22:00</p>
        </div>

        <div className="footer-social">
          <p>
            <FaInstagram /> @fitnessprime_gym
          </p>
          <p>
            <FaFacebookF /> /FitnessPrimeOficial
          </p>
          <p>
            <FaTwitter /> @FitnessPrimeOk
          </p>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} FITNESS PRIME. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
