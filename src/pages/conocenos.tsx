import React, { useEffect, useState } from 'react';
import './conocenos.css';

import imagenGimnasio from '../assets/conocenos1.jpg';

interface Entrenador {
  id: number;
  nombre: string;
  //especialidad: string;
  frase: string;
  fotoUrl: string;
}

export default function ConocenosPage(): React.JSX.Element {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);

  useEffect(() => {
    fetch('http://localhost:5500/api/entrenadores')
      .then((res) => res.json())
      .then((data) => {
        console.log('📦 Data del backend:', data);
        setEntrenadores(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="conocenos-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero__text">
          <h1>DESAFÍA TUS LÍMITES</h1>
          <p>
            En Fitness Prime, transformamos tu cuerpo y tu mente. Clases de
            fuerza, boxeo, HIIT, yoga y entrenamiento personalizado para que
            alcances tu máximo potencial
          </p>
        </div>
        <div className="hero__images">
          <img src={imagenGimnasio} alt="Gimnasio Fitness Prime" />
        </div>
      </section>

      <section className="trainers-section">
        <h2>Nuestros Entrenadores</h2>
        <div className="trainers-carousel">
          {entrenadores.map((entrenador) => {
            const fullUrl = `http://localhost:5500${entrenador.fotoUrl}`;
            console.log('🖼️ URL final:', fullUrl);
            return (
              <div
                key={entrenador.id}
                className="trainer-card"
                style={{
                  backgroundImage: `url(${fullUrl})`,
                }}
              >
                <div className="trainer-info">
                  <h3>{entrenador.nombre}</h3>
                  <p className="trainer-phrase">“{entrenador.frase}”</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
