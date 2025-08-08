import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register = (): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('¡Registro exitoso! (Ejemplo)');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="title">CREÁ TU CUENTA</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Nombre completo</label>
          <input type="text" placeholder="Tu nombre" required />

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

          <label>Confirmar contraseña</label>
          <div className="input-group">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <button type="submit">Registrarme</button>
        </form>

        <p className="redirect">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
