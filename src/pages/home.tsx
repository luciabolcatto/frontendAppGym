import React from "react";
import "./home.css";
import paginainicio from "../assets/paginainicio.jpg";

export default function Home(): React.JSX.Element {
  return (
    <div className="home-container">
      <div className="main-content">
        <img src={paginainicio} alt="Gym" className="hero-image" />
        <div className="text-content">
          <h1>LIBERÁ TU POTENCIAL</h1>
          <p>Unite a nosotros y sentí la diferencia</p>
        </div>
      </div>
    </div>
  );
}


