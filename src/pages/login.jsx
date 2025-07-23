import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const usuarioEncontrado = usuarios.find(
      (u) => u.email === email && u.password === password
    );

    if (usuarioEncontrado) {
      localStorage.setItem('usuario', JSON.stringify(usuarioEncontrado));
      alert('Iniciaste sesión (ejemplo)');
      navigate('/home');
    } else {
      alert('Email o contraseña incorrectos');
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

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
