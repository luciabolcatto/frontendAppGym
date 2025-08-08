import React, { useState, useEffect } from 'react';
import './reservas.css';

interface ReservaItem {
  id: number;
  clase: string;
  fecha: string;
  horario: string;
}

const Reservas = (): React.JSX.Element => {
  const [form, setForm] = useState<Omit<ReservaItem, 'id'>>({ clase: '', fecha: '', horario: '' });
  const [reservas, setReservas] = useState<ReservaItem[]>([]);

  useEffect(() => {
    const saved: ReservaItem[] = JSON.parse(localStorage.getItem('reservas') || '[]');
    setReservas(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nuevaReserva: ReservaItem = { ...form, id: Date.now() };
    const nuevas = [...reservas, nuevaReserva];
    setReservas(nuevas);
    localStorage.setItem('reservas', JSON.stringify(nuevas));
    setForm({ clase: '', fecha: '', horario: '' });
  };

  const cancelarReserva = (id: number) => {
    const filtradas = reservas.filter((r) => r.id !== id);
    setReservas(filtradas);
    localStorage.setItem('reservas', JSON.stringify(filtradas));
  };

  return (
    <div className="reserva-container">
      <h2>Reservar Clase</h2>
      <form onSubmit={handleSubmit} className="reserva-form">
        <input
          type="text"
          name="clase"
          placeholder="Ej: Funcional"
          value={form.clase}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="horario"
          value={form.horario}
          onChange={handleChange}
          required
        />
        <button type="submit">Reservar</button>
      </form>

      <h3>Mis Reservas</h3>
      <ul className="lista-reservas">
        {reservas.length === 0 && <p>No tenés reservas aún.</p>}
        {reservas.map((res) => (
          <li key={res.id}>
            <strong>{res.clase}</strong> el {res.fecha} a las {res.horario}
            <button onClick={() => cancelarReserva(res.id)}>Cancelar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reservas;
