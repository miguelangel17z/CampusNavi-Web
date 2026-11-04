/**
 * Narración del video: texto (narracion.json) y audios generados por scripts/narracion.py.
 * Los tiempos de inicio están en timeline.ts (`narraciones`).
 */
import datos from "./narracion.json";
import manifest from "../public/narracion/manifest.json";
import { FPS } from "./tema";

export type Frase = { id: string; texto: string };
export type ManifestNarracion = {
  voz: string;
  velocidad: string;
  frases: Record<string, { sha256: string; duracionSeg: number }>;
};

export const vozNarracion: string = datos.voz;
export const velocidadNarracion: string = datos.velocidad;
export const frases: Frase[] = datos.frases;
export const manifestNarracion: ManifestNarracion = manifest;

/** Ruta relativa a `public/`, para usar con `staticFile`. */
export const archivoNarracion = (id: string) => `narracion/${id}.mp3`;

/** Duración del audio en frames (redondeada hacia arriba). */
export function duracionNarracionFrames(id: string): number {
  const f = manifestNarracion.frases[id];
  if (!f) throw new Error(`No hay audio para la narración «${id}»: corre scripts/narracion.py`);
  return Math.ceil(f.duracionSeg * FPS);
}
