import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminMenu.css';

const AdminMenu = (): React.JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro que querés cerrar sesión?");
    if (!confirmLogout) return; 

    localStorage.removeItem('adminToken'); 
    alert('Sesión de administrador cerrada');
    navigate('/'); 
  };

  return (
    <div className="admin-menu-container">
      <h1 className="admin-menu-title">MENÚ ADMINISTRADOR</h1>

      <div className="admin-menu-buttons">
        <button onClick={() => navigate('/admin/usuarios-por-estado')}>
          Informe de usuarios por estado
        </button>
        <button onClick={() => navigate('/admin/informe-reservas')}>
          Informe de reservas por clases
        </button>
        <button className="btn-danger" onClick={handleLogout}>
          Cerrar sesión y volver al Home
        </button>
      </div>
    </div>
  );
};

export default AdminMenu;