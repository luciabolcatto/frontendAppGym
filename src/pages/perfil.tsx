import React, { useState, useEffect } from 'react';
import './Perfil.css';

interface DatosPerfil {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  altura: string;
  peso: string;
  estadoSalud: string;
  foto: string | null;
}

const Perfil = (): React.JSX.Element => {
  const [datos, setDatos] = useState<DatosPerfil>({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    altura: '',
    peso: '',
    estadoSalud: '',
    foto: null,
  });
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || 'null') as DatosPerfil | null;
    if (userData) setDatos(userData);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    const reader = new FileReader();
    reader.onloadend = () => setDatos((prev) => ({ ...prev, foto: reader.result as string }));
    if (archivo) reader.readAsDataURL(archivo);
  };

  const handleGuardar = () => {
    localStorage.setItem('userData', JSON.stringify(datos));
    setModoEdicion(false);
    alert('Datos guardados correctamente ✅');
  };

  return (
    <div className="perfil-container">
      <h2 className="perfil-title">Perfil</h2>

      <div className="perfil-card">
        <div className="perfil-left">
          <div className="perfil-avatar">
            {datos.foto ? (
              <img src={datos.foto} alt="Foto de perfil" />
            ) : (
              <div className="avatar-placeholder">Sin foto</div>
            )}
            {modoEdicion && (
              <input type="file" accept="image/*" onChange={handleFoto} />
            )}
          </div>
          <h3 className="perfil-nombre">
            {datos.nombre || 'Nombre'} {datos.apellido || 'Apellido'}
          </h3>
        </div>

        <div className="perfil-right">
          <div className="perfil-form">
            <label>Nombre</label>
            <input
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Apellido</label>
            <input
              name="apellido"
              value={datos.apellido}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Teléfono</label>
            <input
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Dirección</label>
            <input
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Altura (cm)</label>
            <input
              name="altura"
              value={datos.altura}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Peso (kg)</label>
            <input
              name="peso"
              value={datos.peso}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            <label>Estado de salud</label>
            <input
              name="estadoSalud"
              value={datos.estadoSalud}
              onChange={handleChange}
              disabled={!modoEdicion}
            />

            {modoEdicion ? (
              <button onClick={handleGuardar}>💾 Guardar Cambios</button>
            ) : (
              <button onClick={() => setModoEdicion(true)}>
                ✏️ Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
