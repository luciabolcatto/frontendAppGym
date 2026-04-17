import React, { useEffect, useState } from 'react';
import './conocenos.css';

import imagenGimnasio from '../assets/conocenos1.jpg';
import StarRating from '../components/StarRating';
import { buildApiUrl, buildPublicUrl } from '../shared/config';
import {
  obtenerResumenValoraciones,
  enviarValoracion,
} from '../services/valoracionService';

interface Entrenador {
  id: string;
  nombre: string;
  frase: string;
  fotoUrl: string;
}

type Resumen = {
  promedio: number;
  cantidad: number;
};

export default function ConocenosPage(): React.JSX.Element {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);

  // ✅ Paso 3: resumen por entrenador
  const [resumenPorEntrenador, setResumenPorEntrenador] = useState<
    Record<string, Resumen>
  >({});

  // ✅ Paso 4: modal de valoración
  const [modalAbierto, setModalAbierto] = useState(false);
  const [entrenadorSeleccionado, setEntrenadorSeleccionado] =
    useState<Entrenador | null>(null);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorValoracion, setErrorValoracion] = useState<string | null>(null);

  function abrirModal(entrenador: Entrenador) {
    setEntrenadorSeleccionado(entrenador);
    setRating(0);
    setComentario('');
    setErrorValoracion(null);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEntrenadorSeleccionado(null);
  }

  async function confirmarValoracion() {
    if (!entrenadorSeleccionado) return;

    setEnviando(true);
    setErrorValoracion(null);

    try {
      await enviarValoracion(entrenadorSeleccionado.id, rating, comentario);

      // refrescar resumen SOLO del entrenador valorado
      const resp = await obtenerResumenValoraciones(entrenadorSeleccionado.id);
      const data = (resp as any).data ?? resp;

      setResumenPorEntrenador((prev) => ({
        ...prev,
        [entrenadorSeleccionado.id]: {
          promedio: Number(data.promedio ?? 0),
          cantidad: Number(data.cantidad ?? 0),
        },
      }));

      cerrarModal();
    } catch (e: any) {
      setErrorValoracion(e?.message || 'No se pudo enviar la valoración');
    } finally {
      setEnviando(false);
    }
  }

  // 1) Traemos entrenadores
  useEffect(() => {
    fetch(buildApiUrl('/api/entrenadores'))
      .then((res) => res.json())
      .then((data) => {
        setEntrenadores(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 2) Paso 3: cargar resumen de valoraciones por entrenador
  useEffect(() => {
    async function cargarResúmenes() {
      if (!entrenadores.length) return;

      const pares = await Promise.all(
        entrenadores.map(async (entrenador) => {
          try {
            const resp = await obtenerResumenValoraciones(entrenador.id);
            const data = (resp as any).data ?? resp;

            const promedio = Number(data.promedio ?? 0);
            const cantidad = Number(data.cantidad ?? 0);

            return [entrenador.id, { promedio, cantidad }] as const;
          } catch {
            return [entrenador.id, { promedio: 0, cantidad: 0 }] as const;
          }
        })
      );

      setResumenPorEntrenador(Object.fromEntries(pares));
    }

    cargarResúmenes();
  }, [entrenadores]);

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
            const fullUrl = buildPublicUrl(entrenador.fotoUrl);

            const resumen = resumenPorEntrenador[entrenador.id] ?? {
              promedio: 0,
              cantidad: 0,
            };

            return (
              <div
                key={entrenador.id}
                className="trainer-card"
                style={{ backgroundImage: `url(${fullUrl})` }}
              >
                <div className="trainer-info">
                  <h3>{entrenador.nombre}</h3>
                  <p className="trainer-phrase">“{entrenador.frase}”</p>

                  {/* ✅ Paso 3: estrellas + promedio */}
                  <div className="trainer-rating">
                    <StarRating
                      value={Math.round(resumen.promedio)}
                      readOnly
                      size={18}
                    />
                    <span className="trainer-rating-text">
                      {resumen.promedio.toFixed(1)} ({resumen.cantidad})
                    </span>
                  </div>

                  {/* ✅ Paso 4: botón */}
                  <button
                    type="button"
                    className="btn-valorar"
                    onClick={() => abrirModal(entrenador)}
                  >
                    Valorar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✅ Paso 4: Modal */}
      {modalAbierto && entrenadorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Valorar a {entrenadorSeleccionado.nombre}</h3>
              <button className="modal-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <div className="modal-stars">
              <StarRating value={rating} onChange={setRating} size={26} />
              <span className="modal-hint">Seleccioná de 1 a 5 estrellas</span>
            </div>

            <div className="modal-textarea">
              <label>Comentario (opcional)</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Contá tu experiencia..."
                rows={4}
              />
            </div>

            {errorValoracion && (
              <div className="modal-error">{errorValoracion}</div>
            )}

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={cerrarModal}>
                Cancelar
              </button>

              <button
                className="btn-enviar"
                onClick={confirmarValoracion}
                disabled={enviando || rating === 0}
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
