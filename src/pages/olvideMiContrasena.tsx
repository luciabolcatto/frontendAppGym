import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './olvideMiContrasena.css';

const API_BASE = import.meta.env?.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5500';

export default function OlvideMiContrasena() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/Usuarios/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar el código');
      }

      alert('Si el email está registrado, recibirás un código en tu correo electrónico');
      localStorage.setItem('resetEmail', email);
      navigate('/restablecer-contrasena');

    } catch (err: any) {
      alert(err.message || 'Error al solicitar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="olvide-contrasena-container">
      <div className="olvide-contrasena-box">
        <h2 className="title">¿Olvidaste tu contraseña?</h2>
        <p className="subtitle">
          Ingresa tu email y te enviaremos un código de recuperación
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="tu-email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-secondary"
            disabled={loading}
          >
            Volver al login
          </button>
        </form>
      </div>
    </div>
  );
}
