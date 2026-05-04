import { buildApiUrl } from '../shared/config';

const API_URL = buildApiUrl('/api/valoraciones');

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error('No hay token de autenticación. Inicia sesión nuevamente.');
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
 //pide al back el promedio de valoriciones y cantidad
export async function obtenerResumenValoraciones(entrenadorId: string) {
  const res = await fetch(
    `${API_URL}/resumen?entrenador=${entrenadorId}`
  );

  if (!res.ok) {
    throw new Error("Error al obtener resumen de valoraciones");
  }

  return res.json(); // { promedio, cantidad }
}
// envia la valoracion con el usuario + el entrenador + rating
export async function enviarValoracion(
  entrenadorId: string,
  rating: number,
  comentario?: string
) {
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    throw new Error("Usuario no logueado");
  }

  const usuarioId = JSON.parse(usuario).id;
// envia la valoracion al back con post en el back se crea o actualiza 
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      usuario: usuarioId,
      entrenador: entrenadorId,
      rating,
      comentario,
    }),
  });

  if (!res.ok) {
    throw new Error("Error al enviar valoración");
  }

  return res.json();
}
