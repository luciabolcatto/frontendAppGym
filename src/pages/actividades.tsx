import React, { useEffect, useState } from "react";
import ActividadList from "../components/ActividadList";
import { Actividad } from "../types/Actividad";

export default function ActividadesPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5500/api/actividad") // <--- AQUÍ se llama al backend
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener actividades");
        return res.json();
      })
      .then((data) => setActividades(data.data)) // data.data porque tu back devuelve { message, data }
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando actividades...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Actividades del Gimnasio</h1>
      <ActividadList actividades={actividades} />
    </div>
  );
}