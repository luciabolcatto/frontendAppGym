import React from 'react';
import './conocenos.css';

import imagenGimnasio from '../assets/conocenos1.jpg';
import profesoraImg from '../assets/profesora.jpg';
import profesorImg from '../assets/profesor.jpg';
import profesor2Img from '../assets/profesor2.jpg';

const entrenadores = [
  {
    nombre: 'Juan Pérez',
    especialidad: 'Entrenamiento de Fuerza',
    frase: 'La disciplina vence al talento.',
    foto: profesor2Img,
  },
  {
    nombre: 'Ana Gómez',
    especialidad: 'Yoga y Pilates',
    frase: 'Respira, conecta y supera tus límites.',
    foto: profesoraImg,
  },
  {
    nombre: 'Carlos Ruiz',
    especialidad: 'Cardio y HIIT',
    frase: 'El sudor de hoy es la fuerza de mañana.',
    foto: profesorImg,
  },
];

export default function ConocenosPage(): React.JSX.Element {
  return (
    <main className="conocenos-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero__text">
          <h1>DESAFIA TUS LIMITES </h1>
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

      {/* CARRUSEL DE ENTRENADORES */}
      <section className="trainers-section">
        <h2>Nuestros Entrenadores</h2>
        <div className="trainers-carousel">
          {entrenadores.map((entrenador) => (
            <div
              key={entrenador.nombre}
              className="trainer-card"
              style={{
                backgroundImage: `url(${entrenador.foto})`,
              }}
            >
              <div className="trainer-info">
                <h3>{entrenador.nombre}</h3>
                <p className="trainer-activity">{entrenador.especialidad}</p>
                <p className="trainer-phrase">“{entrenador.frase}”</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
