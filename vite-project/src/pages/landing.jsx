import './Landing.css';
import imagenFondo from '../assets/tu-imagen.png'; // ⬅️ tu imagen

function Landing() {
  return (
    <div className="landing">
      <h1>¡Bienvenido!</h1>
      <p>Entrená, seguí tu progreso y transformá tu energía 💪</p>
      <img src={imagenFondo} alt="Fondo personalizado" />
      <a href="/login" className="btn">
        Comenzar
      </a>
    </div>
  );
}

export default Landing;
