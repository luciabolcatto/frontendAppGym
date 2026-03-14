import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { Usuario } from "../types/usuario";
import "./cambiarContrasena.css";

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5500";

export default function CambiarContrasena() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mail, setMail] = useState<string>("");

  const [contrasenaAnterior, setContrasenaAnterior] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [showAnterior, setShowAnterior] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      const parsed: Usuario = JSON.parse(storedUser);
      setUsuario(parsed);
      setMail(parsed.mail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario || !mail) {
      toast.error("Usuario no encontrado. Iniciá sesión nuevamente.");
      return;
    }

    if (contrasenaNueva !== confirmarContrasena) {
      toast.error("La nueva contraseña no coincide con la confirmación.");
      return;
    }

    if (contrasenaNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setShowConfirmModal(true);
  };

  const procesarCambioContrasena = async () => {
    setShowConfirmModal(false);

    if (!usuario) {
      toast.error("Usuario no encontrado. Iniciá sesión nuevamente.");
      return;
    }
    
    try {
      // Validar contraseña anterior
      const loginRes = await fetch(`${API_BASE}/api/Usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, contrasena: contrasenaAnterior }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        throw new Error(data.message || "Contraseña anterior incorrecta");
      }

      // PUT con todos los datos + nueva contraseña
      const token = localStorage.getItem("token");
      const updateData: any = { ...usuario, contrasena: contrasenaNueva };

      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const updateRes = await fetch(`${API_BASE}/api/Usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!updateRes.ok) {
        const data = await updateRes.json().catch(() => ({}));
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      const data = await updateRes.json();
      localStorage.setItem("usuario", JSON.stringify(data.data));

      toast.success("Contraseña cambiada correctamente.");
      setContrasenaAnterior("");
      setContrasenaNueva("");
      setConfirmarContrasena("");

      navigate("/perfil");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="cambiar-container">
      <div className="cambiar-box">
        <h2 className="title">CAMBIAR CONTRASEÑA</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Contraseña anterior</label>
          <div className="input-group">
            <input
              type={showAnterior ? "text" : "password"}
              value={contrasenaAnterior}
              onChange={(e) => setContrasenaAnterior(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowAnterior((prev) => !prev)}
            >
              {showAnterior ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <label>Nueva contraseña</label>
          <div className="input-group">
            <input
              type={showNueva ? "text" : "password"}
              value={contrasenaNueva}
              onChange={(e) => setContrasenaNueva(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowNueva((prev) => !prev)}
            >
              {showNueva ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <label>Confirmar nueva contraseña</label>
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <button type="submit">Guardar</button>
          <button
            type="button"
            className="btn-return"
            onClick={() => navigate("/perfil")}
          >
            Volver al perfil
          </button>
        </form>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-icon">🔐</div>
            <h3>Confirmar cambio</h3>
            <p>¿Seguro que deseas cambiar tu contraseña?</p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm" 
                onClick={procesarCambioContrasena}
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}