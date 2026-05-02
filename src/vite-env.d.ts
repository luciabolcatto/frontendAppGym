/// <reference types="vite/client" />

declare const __APP_API_BASE_URL__: string | undefined;

declare module '*.jpg' {
  const src: string;
  export default src;
}
