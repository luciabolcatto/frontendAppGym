import React from 'react';
import './login.css'; // Importás tus estilos

const Login = () => {
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
          <input type="password" placeholder="••••••••" required />

          <button type="submit">Ingresar</button>
          <p>
            ¿No tenés cuenta? <a href="#">Registrate</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
