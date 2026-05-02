// Busca la URL del backend deployado en el env (VITE_API_URL); si no la encuentra, usa localhost
const rawApiBase =
  (globalThis as any).__APP_API_BASE_URL__ ??
  'http://localhost:5500';

export const API_BASE_URL = String(rawApiBase).replace(/\/+$/, '');

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildPublicUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const publicPath = normalizedPath.startsWith('/public/')
    ? normalizedPath
    : normalizedPath.startsWith('/uploads/')
      ? `/public${normalizedPath}`
      : normalizedPath;

  return `${API_BASE_URL}${publicPath}`;
}
