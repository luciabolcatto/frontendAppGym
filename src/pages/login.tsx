import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Usuario } from '../types/usuario';
import './Login.css';

const Login = (): React.JSX.Element => {
  const [mail, setMail] = useState<string>('');
  const [contrasena, setContrasena] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  // Mostrar bienvenida 
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      const user: Usuario = JSON.parse(storedUser);
      alert(`Bienvenido ${user.nombre} ${user.apellido}`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      //  Login
      const res = await fetch('http://localhost:5500/api/Usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error al iniciar sesión');
        return;
      }

      const { token, usuario } = data;
      localStorage.setItem('token', token);

      // Traer datos completos del usuario
      const usuarioRes = await fetch(`http://localhost:5500/api/Usuarios/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuarioData = await usuarioRes.json();

      if (!usuarioRes.ok) {
        alert(usuarioData.message || 'Error al traer datos del usuario');
        return;
      }

      
      localStorage.setItem('usuario', JSON.stringify(usuarioData.data));

      alert(`Bienvenido ${usuarioData.data.nombre} ${usuarioData.data.apellido}`);
      navigate('/home');
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">FITNESS PRIME</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button type="submit">Ingresar</button>

          <p>
            ¿No tenés cuenta? <Link to="/register">Registrate</Link>
          </p>

          <p>
            <Link to="/admin-login" className="admin-link">
              Ingresar como Admin
            </Link>
          </p>

          <p>
            <Link to="/" className="home-link">Volver al Home</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;