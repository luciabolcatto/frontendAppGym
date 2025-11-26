import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowSaveModal(true);
  };

  const procesarActualizacion = async () => {
    setShowSaveModal(false);
    if (!usuario) return;

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
        toast.error(data.message || 'Error al actualizar');
        return;
      }

      const newUsuario = {
        ...usuario,
        ...form,
        fotoPerfil: data.data.fotoPerfil || usuario.fotoPerfil,
      };

      localStorage.setItem('usuario', JSON.stringify(newUsuario));
      notifyUsuarioUpdated();
      setUsuario(newUsuario);
      setEditMode(false);
      setFotoFile(null);
      setFotoPreview(null);
      toast.success('Datos actualizados correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión.');
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const procesarCancelacion = () => {
    setShowCancelModal(false);
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
    setShowLogoutModal(true);
  };

  const procesarLogout = () => {
    setShowLogoutModal(false);
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

            <button onClick={() => navigate('/mis-contratos')}>Mis Contratos</button>
            <button onClick={() => navigate('/mis-reservas')}>Mis Reservas</button>
            <button onClick={() => navigate('/cambiarContrasena')}>Cambiar contraseña</button>
            <button onClick={() => navigate('/borrarCuenta')} className="btn-danger">Eliminar cuenta</button>
            <button onClick={handleLogout} className="btn-danger">Cerrar sesión</button>
          </div>
        </div>
      </div>

      {/* Modal de guardar cambios */}
      {showSaveModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">💾</div>
            <h3>Guardar cambios</h3>
            <p>¿Seguro que deseas guardar los cambios?</p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setShowSaveModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={procesarActualizacion}>Sí, guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelar edición */}
      {showCancelModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">❌</div>
            <h3>Cancelar cambios</h3>
            <p>¿Seguro que deseas cancelar los cambios? Se perderán las modificaciones.</p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setShowCancelModal(false)}>Volver</button>
              <button className="btn-confirm" onClick={procesarCancelacion}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cerrar sesión */}
      {showLogoutModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">🚪</div>
            <h3>Cerrar sesión</h3>
            <p>¿Seguro que deseas cerrar sesión?</p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={procesarLogout}>Sí, cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;