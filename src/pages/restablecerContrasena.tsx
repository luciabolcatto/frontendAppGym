import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './restablecerContrasena.css';

const API_BASE = import.meta.env?.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5500';

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [paso, setPaso] = useState<'validar' | 'cambiar'>('validar');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      navigate('/olvide-mi-contrasena');
    }
  }, [navigate]);

  const handleValidarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo || codigo.length !== 6) {
      alert('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/Usuarios/validar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email, code: codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Código inválido');
      }

      setResetToken(data.resetToken);
      alert('Código validado. Ahora establece tu nueva contraseña');
      setPaso('cambiar');

    } catch (err: any) {
      alert(err.message || 'Error al validar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerContrasena = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaContrasena.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/Usuarios/restablecer-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, nuevaContrasena }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      alert('¡Contraseña restablecida correctamente!');
      localStorage.removeItem('resetEmail');
      navigate('/login');

    } catch (err: any) {
      alert(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restablecer-container">
      <div className="restablecer-box">
        <h2 className="title">Restablecer Contraseña</h2>
        <p className="email-info">Email: <strong>{email}</strong></p>

        {paso === 'validar' ? (
          <form className="form" onSubmit={handleValidarCodigo}>
            <p className="subtitle">
              Ingresa el código de 6 dígitos que enviamos a tu correo
            </p>

            <label htmlFor="codigo">Código de recuperación</label>
            <input
              id="codigo"
              type="text"
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              disabled={loading}
              className="codigo-input"
            />

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Validando...' : 'Validar código'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/olvide-mi-contrasena')}
              className="btn-secondary"
              disabled={loading}
            >
              Solicitar nuevo código
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleRestablecerContrasena}>
            <p className="subtitle">Establece tu nueva contraseña</p>

            <label htmlFor="nueva">Nueva contraseña</label>
            <div className="input-group">
              <input
                id="nueva"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <label htmlFor="confirmar">Confirmar contraseña</label>
            <div className="input-group">
              <input
                id="confirmar"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
