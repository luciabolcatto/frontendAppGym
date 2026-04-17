import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './adminLogin.css';
import { buildApiUrl } from '../shared/config';

const AdminLogin = (): React.JSX.Element => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Limpiamos cualquier sesión de usuario normal
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');

      const res = await fetch(buildApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Contraseña incorrecta');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      toast.success('Bienvenido administrador');
      navigate('/admin'); 
    } catch (error) {
      console.error(error);
      toast.error('Error al conectar con el servidor');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-login-title">ADMIN LOGIN</h1>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>Contraseña</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button type="submit">Ingresar</button>

          <p>
            <a href="/">Volver al Home</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;