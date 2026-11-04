/** Paleta y medidas del sitio Campus Navi (manual/src/app/globals.css). */
export const color = {
  night: "#050816",
  surface: "#0c1030",
  surface2: "#12173d",
  line: "#2e2a6b",
  violet: "#7c4dff",
  violetStrong: "#5b3df5",
  lilac: "#c4b5fd",
  muted: "#aeb2d0",
  ok: "#34d399",
  white: "#ffffff",
} as const;

export const FPS = 30;
export const ANCHO = 1920;
export const ALTO = 1080;

/** Segundos → frames del video final. */
export const s = (segundos: number) => Math.round(segundos * FPS);

export const LEMA = "Accesibilidad y orientación para todos";
export const FIRMA = "Equipo de desarrollo Campus Navi";
