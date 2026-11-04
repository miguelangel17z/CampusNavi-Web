/**
 * Mezcla de audio. Funciones puras de `frame` (absoluto, del video final) → volumen 0..1.
 */
import { DURACION_TOTAL, tramosOriginales } from "./timeline";
import { s } from "./tema";

export const MUSICA_DESDE_SEG = 60;
export const VOL_MUSICA = 0.4;
export const VOL_MUSICA_BAJA = 0.12;
export const VOL_CLIP_BAJO = 0.03;

const SUBIDA_MUSICA = s(7);
const RAMPA_MUSICA = s(0.5);
const RAMPA_CLIP = s(0.3);
const SALIDA_MUSICA = s(2.5);

/** Interpolación lineal con límites (equivalente a interpolate(..., clamp)). */
export function rampa(frame: number, [a, b]: [number, number], [va, vb]: [number, number]) {
  if (b === a) return frame < a ? va : vb;
  const t = Math.min(1, Math.max(0, (frame - a) / (b - a)));
  return va + (vb - va) * t;
}

/** Factor 0..1 que vale 1 dentro de [inicio, fin) con rampas de `r` frames a cada lado (afuera). */
function ventana(frame: number, inicio: number, fin: number, r: number) {
  if (frame < inicio) return rampa(frame, [inicio - r, inicio], [0, 1]);
  if (frame >= fin) return rampa(frame, [fin, fin + r], [1, 0]);
  return 1;
}

export function volumenMusica(frame: number): number {
  let v = VOL_MUSICA * rampa(frame, [0, SUBIDA_MUSICA], [0, 1]);
  for (const o of tramosOriginales) {
    const w = ventana(frame, o.inicio, o.inicio + o.duracion, RAMPA_MUSICA);
    v = Math.min(v, VOL_MUSICA - (VOL_MUSICA - VOL_MUSICA_BAJA) * w);
  }
  v *= rampa(frame, [DURACION_TOTAL - SALIDA_MUSICA, DURACION_TOTAL - 1], [1, 0]);
  return Math.max(0, v);
}

/** Volumen del audio original de una toma. Al 100 % solo en sus tramos originales. */
export function volumenClip(tomaId: string, frame: number): number {
  let w = 0;
  for (const o of tramosOriginales.filter((x) => x.toma === tomaId)) {
    // La rampa queda por dentro del tramo para no dejar oír voces fuera de él.
    const inicio = o.inicio;
    const fin = o.inicio + o.duracion;
    const dentro = Math.min(rampa(frame, [inicio, inicio + RAMPA_CLIP], [0, 1]), rampa(frame, [fin - RAMPA_CLIP, fin], [1, 0]));
    w = Math.max(w, frame >= inicio && frame < fin ? dentro : 0);
  }
  return VOL_CLIP_BAJO + (1 - VOL_CLIP_BAJO) * w;
}
