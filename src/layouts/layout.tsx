import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Layout(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      {/* Navbar fija en todas las páginas */}
      <nav
        className="navbar"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "#00bfff" }}>
            FITNESS PRIME
          </Link>
        </div>

        {/* Centro: Actividades, Planes y Clases */}
        <div
          className="nav-center"
          style={{ flex: 1, display: "flex", justifyContent: "center", gap: "12px" }}
        >
          <button onClick={() => navigate("/actividades")}>Actividades</button>
          <button onClick={() => navigate("/clases")}>Clases</button>
          <button>Conócenos</button>
        </div>

        {/* Derecha: Conócenos e Iniciar sesión (login queda donde estaba) */}
        <div className="nav-right" style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/planes")}>Planes</button>
        </div>
        <div className="nav-right2" style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/login")}>Iniciar sesión</button>
        </div>
      </nav>

      {/* Aquí se renderiza la página actual */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
