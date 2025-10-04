import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import type { Usuario } from '../types/usuario';
import './Perfil.css';
import { notifyUsuarioUpdated } from '../hooks/useUsuario';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5500';

function resolveImageUrl(u: Usuario): string | undefined {
  if (u.fotoPerfil) {
    if (/^https?:\/\//i.test(u.fotoPerfil)) return u.fotoPerfil;
    const path = u.fotoPerfil.startsWith('/') ? u.fotoPerfil : `/${u.fotoPerfil}`;
    return `${API_BASE}/public${path}`;
  }
  return undefined;
}

const Perfil = (): React.JSX.Element => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      const parsed: Usuario = JSON.parse(storedUser);
      setUsuario(parsed);
      setForm({
        nombre: parsed.nombre,
        apellido: parsed.apellido,
        tel: parsed.tel,
        mail: parsed.mail,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const getFotoSrc = () => {
    if (fotoPreview) return fotoPreview;
    if (usuario) {
      const url = resolveImageUrl(usuario);
      if (url) return `${url}?t=${new Date().getTime()}`; // cache-buster
    }
    return '';
  };

  const handleUpdate = async () => {
    if (!usuario) return;
    if (!window.confirm('¿Seguro que deseas guardar los cambios?')) return;

    try {
      const token = localStorage.getItem('token');

      const updateData: any = { ...usuario, ...form };

      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null ) {
          formData.append(key, value.toString());
        }
      });

      if (fotoFile) formData.append('fotoPerfil', fotoFile);

      const res = await fetch(`${API_BASE}/api/Usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Error al actualizar');
        return;
      }

      const newUsuario = {
        ...usuario,
        ...form,
        fotoPerfil: data.data.fotoPerfil || usuario.fotoPerfil,
      };

      localStorage.setItem('usuario', JSON.stringify(newUsuario));
      notifyUsuarioUpdated(); // Notificar al layout que se actualizó el usuario
      setUsuario(newUsuario);
      setEditMode(false);
      setFotoFile(null);
      setFotoPreview(null);
      alert('Datos actualizados correctamente');
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    }
  };

  const handleCancel = () => {
    if (!window.confirm('¿Seguro que deseas cancelar los cambios?')) return;
    if (usuario) setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      tel: usuario.tel,
      mail: usuario.mail,
    });
    setEditMode(false);
    setFotoPreview(null);
    setFotoFile(null);
  };

  const handleLogout = () => {
    if (!window.confirm('¿Seguro que deseas cerrar sesión?')) return;
    localStorage.clear();
    navigate('/login');
  };

  if (!usuario) return <p style={{ color: '#fff' }}>Cargando perfil...</p>;

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Mi Perfil</h1>
      <div className="perfil-card">
        <div className="perfil-left">
          {getFotoSrc() ? (
            <img
              src={getFotoSrc()}
              alt="Foto perfil"
              className="perfil-preview"
              onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
            />
          ) : (
            <FaUserCircle size={150} color="#ffffff" />
          )}
          {editMode && <input type="file" accept="image/*" onChange={handleImageChange} />}
          <h2 className="perfil-nombre">{usuario.nombre} {usuario.apellido}</h2>
        </div>

        <div className="perfil-right">
          <div className="perfil-form">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre || ''} onChange={handleChange} disabled={!editMode} />
            <label>Apellido</label>
            <input name="apellido" value={form.apellido || ''} onChange={handleChange} disabled={!editMode} />
            <label>Teléfono</label>
            <input name="tel" value={form.tel?.toString() || ''} onChange={handleChange} disabled={!editMode} />
            <label>Email</label>
            <input name="mail" value={form.mail || ''} onChange={handleChange} disabled={!editMode} />

            {editMode ? (
              <>
                <button onClick={handleUpdate}>Guardar</button>
                <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)}>Editar</button>
            )}

            
            <button onClick={() => navigate('/cambiarContrasena')}>Cambiar contraseña</button>
            <button onClick={() => navigate('/borrarCuenta')} className="btn-danger">Eliminar cuenta</button>
            <button onClick={handleLogout} className="btn-danger">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;