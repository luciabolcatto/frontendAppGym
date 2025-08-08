
import React from "react";
import { Actividad } from "../types/Actividad";

interface Props {
  actividades: Actividad[];
}

export default function ActividadList({ actividades }: Props) {
  if (actividades.length === 0) {
    return <p>No hay actividades registradas.</p>;
  }

  return (
    <table border={1} cellPadding={6}>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Cupo</th>
        </tr>
      </thead>
      <tbody>
        {actividades.map((act) => (
          <tr key={act.id}>
            <td>{act.nombre}</td>
            <td>{act.descripcion}</td>
            <td>{act.cupo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
