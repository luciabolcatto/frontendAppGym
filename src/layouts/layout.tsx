import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Layout(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="layout-container">
      {/* Navbar fija en todas las páginas */}
      <nav className="navbar">
        <div className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "#00bfff" }}>
            FITNESS PRIME
          </Link>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate("/login")}>Iniciar sesión</button>
          <button onClick={() => navigate("/actividades")}>Actividades</button>
          <button>Conócenos</button>
        </div>
      </nav>

      {/* Aquí se renderiza la página actual */}
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
