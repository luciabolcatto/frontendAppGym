import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Usuario } from '../types/usuario';
import './Register.css';
import { notifyUsuarioUpdated } from '../hooks/useUsuario';

const Register = (): React.JSX.Element => {
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [tel, setTel] = useState<string>('');
  const [mail, setMail] = useState<string>('');
  const [contrasena, setContrasena] = useState<string>('');
  const [confirmContrasena, setConfirmContrasena] = useState<string>('');
  const [foto, setFoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (contrasena !== confirmContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      alert('Email no válido');
      return;
    }

    if (tel && !/^\d+$/.test(tel)) {
      alert('Teléfono solo debe contener números');
      return;
    }

    try {
      // Preparar FormData para enviar al backend (incluye imagen)
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellido', apellido);
      formData.append('tel', tel);
      formData.append('mail', mail);
      formData.append('contrasena', contrasena);
      if (foto) formData.append('fotoPerfil', foto);

      //  Registrar usuario
      const res = await fetch('http://localhost:5500/api/Usuarios/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Error al registrarse');
        return;
      }

      //  Login automático después de registro
      const loginRes = await fetch('http://localhost:5500/api/Usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, contrasena }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        alert(loginData.message || 'Error al iniciar sesión');
        return;
      }

      const { token, usuario } = loginData;
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
      notifyUsuarioUpdated(); // Notificar al layout que se actualizó el usuario
      
      // Mensaje de bienvenida
      alert(`¡Bienvenido ${usuarioData.data.nombre} ${usuarioData.data.apellido}!`);
      navigate('/home');
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="title">CREÁ TU CUENTA</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label>Apellido</label>
          <input
            type="text"
            placeholder="Tu apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />

          <label>Teléfono</label>
          <input
            type="text"
            placeholder="Tu teléfono"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />

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

          <label>Confirmar contraseña</label>
          <div className="input-group">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmContrasena}
              onChange={(e) => setConfirmContrasena(e.target.value)}
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

          <label>Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
          />

          <button type="submit">Registrarme</button>
        </form>

        <p className="redirect">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>

        <p>
          <Link to="/" className="home-link">Volver al Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

