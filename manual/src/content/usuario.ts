import data from "./usuario.json";
import type { CapturaId } from "./capturas";

export type Paso = {
  id: string;
  titulo: string;
  parrafos: string[];
  lista?: string[];
  despues?: string[];
  oiras?: string[];
  capturas?: CapturaId[];
};

export type ManualUsuario = {
  titulo: string;
  intro: string;
  comoUsar: string[];
  cierre: string;
  pasos: Paso[];
};

export const manualUsuario = data as ManualUsuario;

export const tituloPaso = (paso: Paso, indice: number) => `Paso ${indice + 1}. ${paso.titulo}`;

export const audioPaso = (paso: Paso) => `/audio/${paso.id}.mp3`;
export const AUDIO_COMPLETO = "/audio/completo.mp3";

/**
 * Texto que se narra en el audio de un paso.
 * DEBE coincidir con `narracion_paso` de `scripts/generate_audio.py`
 * (la prueba de audios compara el hash de ambos).
 */
export function narracionPaso(paso: Paso, indice: number): string {
  const partes = [`${tituloPaso(paso, indice)}.`, ...paso.parrafos, ...(paso.lista ?? []), ...(paso.despues ?? [])];
  if (paso.oiras?.length) partes.push("La app te dirá:", ...paso.oiras);
  return partes.join(" ");
}

/** Texto del audio del manual completo. Debe coincidir con `narracion_completa` del script. */
export function narracionCompleta(manual: ManualUsuario = manualUsuario): string {
  return [manual.titulo + ".", manual.intro, ...manual.pasos.map(narracionPaso), manual.cierre].join(" ");
}
