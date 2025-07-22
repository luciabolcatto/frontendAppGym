import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Iniciaste sesión (ejemplo)');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">FITNESS PRIME</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input type="email" placeholder="tuemail@ejemplo.com" required />

          <label>Contraseña</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
        </form>
      </div>
    </div>
  );
};

export default Login;
