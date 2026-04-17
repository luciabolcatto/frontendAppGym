import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import './borrarCuenta.css';
import { buildApiUrl } from '../shared/config';

export default function BorrarCuenta() {
  const navigate = useNavigate();
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [mail, setMail] = useState<string>("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsuarioId(parsed.id);
      setMail(parsed.mail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioId || !mail) {
      toast.error("Usuario no encontrado. Inicia sesión nuevamente.");
      return;
    }

    setShowConfirmModal(true);
  };

  const procesarEliminacion = async () => {
    setShowConfirmModal(false);

    try {
      // Validar contraseña mediante login
      const loginRes = await fetch(buildApiUrl('/api/Usuarios/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, contrasena }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        throw new Error(data.message || "Contraseña incorrecta");
      }

      // Eliminar cuenta
      const token = localStorage.getItem("token");
      const deleteRes = await fetch(buildApiUrl(`/api/Usuarios/${usuarioId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!deleteRes.ok) {
        const data = await deleteRes.json().catch(() => ({}));
        throw new Error(data.message || "Error al eliminar la cuenta");
      }

      toast.success("Cuenta eliminada correctamente.");
      setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, 500);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="eliminar-container">
      <div className="eliminar-box">
        <h2 className="title">Eliminar Cuenta</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>Introduce tu contraseña</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <button type="submit" className="btn-danger">
            Borrar cuenta
          </button>
          <button type="button" className="btn-cancel" onClick={() => navigate("/perfil")}>
            Volver al perfil
          </button>
        </form>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">⚠️</div>
            <h3>¡Atención!</h3>
            <p>Esta acción eliminará tu cuenta permanentemente.</p>
            <p className="confirm-warning">¿Estás seguro de que deseas continuar?</p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={procesarEliminacion}
              >
                Sí, eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}