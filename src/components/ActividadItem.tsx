import React from "react";
import { Actividad } from "../types/actividad";
import "../pages/actividades.css";

interface Props {
  actividad: Actividad;
}

const ActividadItem: React.FC<Props> = ({ actividad }) => {
  return (
    <li className="actividad-item">
      <strong className="actividad-nombre">{actividad.nombre}</strong>
      <div className="actividad-descripcion">{actividad.descripcion}</div>
      <div className="actividad-cupo">Cupo: {actividad.cupo}</div>
    </li>
  );
};

export default ActividadItem;