import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './adminMenu.css';

const AdminMenu = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      toast.error('Acceso denegado. Debes ser administrador para acceder a esta página.');
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmarLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('adminToken'); 
    toast.success('Sesión de administrador cerrada');
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

      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">🚪</div>
            <h3>Cerrar sesión</h3>
            <p>¿Estás seguro que querés cerrar sesión?</p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm" 
                onClick={confirmarLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;