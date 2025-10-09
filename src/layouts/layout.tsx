import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './layout.css';
import { FaInstagram, FaFacebookF, FaTwitter, FaUserCircle } from 'react-icons/fa';
import type { Usuario } from '../types/usuario';
import { useUsuario } from '../hooks/useUsuario';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5500';

function resolveImageUrl(u: Usuario): string | undefined {
  if (u.fotoPerfil) {
    if (/^https?:\/\//i.test(u.fotoPerfil)) return u.fotoPerfil;
    const path = u.fotoPerfil.startsWith('/') ? u.fotoPerfil : `/${u.fotoPerfil}`;
    return `${API_BASE}/public${path}`;
  }
  return undefined;
}

export default function Layout(): React.JSX.Element {
  const navigate = useNavigate();
  const usuario = useUsuario(); // Ahora usa el hook con recarga automática

  const handleProfileClick = () => {
    if (!usuario) {
      alert('Debes iniciar sesión para acceder al perfil');
      navigate('/login');
      return;
    }
    navigate('/perfil');
  };

  const handleProtectedRoute = (path: string) => {
    if (!usuario) {
      alert('Debes iniciar sesión para acceder a esta sección');
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const handlePublicRoute = (path: string) => {
    if (usuario) {
      alert('Ya has iniciado sesión');
      navigate('/home');
      return;
    }
    navigate(path);
  };

  const getAvatarSrc = () => {
    if (!usuario || !usuario.fotoPerfil) return undefined;
    return resolveImageUrl(usuario);
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: '#00bfff' }}>
            FITNESS PRIME
          </Link>
        </div>

        <div className="nav-left">
          <button onClick={() => navigate('/actividades')}>Actividades</button>
          <button onClick={() => handleProtectedRoute('/clases')}>Clases</button>
          <button onClick={() => navigate('/conocenos')}>Conócenos</button>
          <button onClick={() => navigate('/planes')}>Planes</button>

          {usuario ? (
            <button onClick={handleProfileClick} className="profile-btn">
              {getAvatarSrc() ? (
                <img
                  src={getAvatarSrc()}
                  alt="avatar"
                  className="avatar"
                />
              ) : (
                <FaUserCircle size={32} />
              )}
              <span className="usuario-nombre">{usuario.nombre}</span>
            </button>
          ) : (
            <>
              <button onClick={() => handlePublicRoute('/login')}>Iniciar sesión</button>
              
            </>
          )}
        </div>
      </nav>

      <main className="layout-main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-top">
          <h2>FITNESS PRIME</h2>
          <p>Zeballos 1341 - Rosario, Argentina</p>
          <p>Email: fitnessprime@gmail.com</p>
          <p>Tel: +54 341 456-7890</p>
          <p>Horario: Lunes a Sábado de 7:00 a 22:00</p>
        </div>

        <div className="footer-social">
          <p><FaInstagram /> @fitnessprime_gym</p>
          <p><FaFacebookF /> /FitnessPrimeOficial</p>
          <p><FaTwitter /> @FitnessPrimeOk</p>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FITNESS PRIME. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}