//HAY QUE PROBARLO AUN

import React, { useState, useEffect } from 'react';
import './Perfil.css';

const Perfil = () => {
  // Estado principal que guarda todos los campos del perfil
  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    altura: '',
    peso: '',
    estadoSalud: '',
    foto: null,
  });

  // Controla si el perfil está en modo edición o no
  const [modoEdicion, setModoEdicion] = useState(false);

  // Al montar el componente, carga los datos desde localStorage si existen
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) setDatos(userData);
  }, []);

  // Maneja cambios en los inputs de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  // Maneja la carga de una nueva foto (se convierte en base64)
  const handleFoto = (e) => {
    const archivo = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setDatos({ ...datos, foto: reader.result });
    if (archivo) reader.readAsDataURL(archivo);
  };

  // Guarda los datos en localStorage y desactiva el modo edición
  const handleGuardar = () => {
    localStorage.setItem('userData', JSON.stringify(datos));
    setModoEdicion(false);
    alert('Datos guardados correctamente ✅');
  };

  return (
    <div className="perfil-container">
      <h2 className="perfil-title">Perfil</h2>

      <div className="perfil-card">
        {/* Lado izquierdo: avatar y nombre */}
        <div className="perfil-left">
          <div className="perfil-avatar">
            {datos.foto ? (
              <img src={datos.foto} alt="Foto de perfil" />
            ) : (
              <div className="avatar-placeholder">Sin foto</div>
            )}
            {/* Campo de carga de foto visible solo si está en modo edición */}
            {modoEdicion && (
              <input type="file" accept="image/*" onChange={handleFoto} />
            )}
          </div>
          <h3 className="perfil-nombre">
            {datos.nombre || 'Nombre'} {datos.apellido || 'Apellido'}
          </h3>
        </div>

        {/* Lado derecho: formulario de datos */}
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

            {/* Botón cambia según el modo: editar o guardar */}
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
