const rawApiBase =
  (globalThis as any).__APP_API_BASE_URL__ ??
  (globalThis as any)?.process?.env?.VITE_API_URL ??
  'http://localhost:5500';

export const API_BASE_URL = String(rawApiBase).replace(/\/+$/, '');
