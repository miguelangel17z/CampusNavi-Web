/**
 * Línea de tiempo del video. Fuente única de tiempos: escenas, componentes y subtítulos leen de aquí.
 * Todo en frames del video final (30 fps), salvo `desde`/`hasta`, que son segundos del clip original.
 * Para cambiar un tramo, edita solo TOMAS / NARRACIONES / ROTULOS y corre `npm test`.
 */
import type { ClipId } from "./material";
import { FPS, s } from "./tema";

export type EscenaId = "intro" | "quienes" | "talkback" | "pruebas" | "usuario3" | "cierre";

export type Escena = { id: EscenaId; titulo: string; inicio: number; duracion: number };
export type Toma = {
  id: string;
  escena: EscenaId;
  clip: ClipId;
  /** Segundos del clip original. */
  desde: number;
  hasta: number;
  inicio: number;
  duracion: number;
};
export type TramoOriginal = {
  toma: string;
  clip: ClipId;
  desdeSeg: number;
  hastaSeg: number;
  inicio: number;
  duracion: number;
  subtitulo: string;
};
export type Narracion = { id: string; escena: EscenaId; inicio: number };
export type Rotulo = { id: string; texto: string; detalle?: string; inicio: number; duracion: number };

// --- Escenas (duración en segundos) -------------------------------------------------------------
const DURACIONES: [EscenaId, string, number][] = [
  ["intro", "Intro", 5],
  ["quienes", "Quiénes somos", 14],
  ["talkback", "TalkBack", 19],
  ["pruebas", "Pruebas con usuarios", 24],
  ["usuario3", "La app responde", 12],
  ["cierre", "Cierre", 8],
];

export const escenas: Escena[] = (() => {
  let cursor = 0;
  return DURACIONES.map(([id, titulo, seg]) => {
    const e = { id, titulo, inicio: cursor, duracion: s(seg) };
    cursor += e.duracion;
    return e;
  });
})();

export const DURACION_TOTAL = escenas.reduce((acc, e) => acc + e.duracion, 0);
export const escena = (id: EscenaId) => escenas.find((e) => e.id === id)!;

// --- Tomas: qué tramo de cada clip va en cada escena, en orden --------------------------------------
const TOMAS: { id: string; escena: EscenaId; clip: ClipId; desde: number; hasta: number }[] = [
  // Usuario 2, 0:00–0:50: el equipo explica la app.
  { id: "u2-explica", escena: "quienes", clip: "usuario2", desde: 6, hasta: 20 },
  // TalkBack: 0:43–0:49 orbe con TalkBack (narración encima), 0:49–1:02 audio original.
  { id: "tb", escena: "talkback", clip: "talkback", desde: 43, hasta: 62 },
  // Usuario 1 (después del segundo 6): la vuelta de 360°.
  { id: "u1-vuelta", escena: "pruebas", clip: "usuario1", desde: 7, hasta: 17 },
  // Usuario 2 desde 0:50: él prueba la app girando con el celular.
  { id: "u2-prueba", escena: "pruebas", clip: "usuario2", desde: 78, hasta: 86 },
  // Usuario 1, final del clip: escucha el resultado con el celular en la mano.
  { id: "u1-resultado", escena: "pruebas", clip: "usuario1", desde: 50, hasta: 56 },
  // Usuario 3: 0:19–0:29 se oye cómo responde la app.
  { id: "u3", escena: "usuario3", clip: "usuario3", desde: 18, hasta: 30 },
];

export const tomas: Toma[] = (() => {
  const cursores = new Map(escenas.map((e) => [e.id, e.inicio]));
  return TOMAS.map((t) => {
    const inicio = cursores.get(t.escena)!;
    const duracion = s(t.hasta - t.desde);
    cursores.set(t.escena, inicio + duracion);
    return { ...t, inicio, duracion };
  });
})();

export const toma = (id: string) => tomas.find((t) => t.id === id)!;

// --- Tramos con audio original al 100 % (sin narración) ---------------------------------------------
const ORIGINALES: { toma: string; desdeSeg: number; hastaSeg: number; subtitulo: string }[] = [
  { toma: "tb", desdeSeg: 49, hastaSeg: 62, subtitulo: "[TalkBack hablando]" },
  { toma: "u3", desdeSeg: 19, hastaSeg: 29, subtitulo: "[La app responde por voz]" },
];

export const tramosOriginales: TramoOriginal[] = ORIGINALES.map((o) => {
  const t = toma(o.toma);
  return {
    ...o,
    clip: t.clip,
    inicio: t.inicio + Math.round((o.desdeSeg - t.desde) * FPS),
    duracion: s(o.hastaSeg - o.desdeSeg),
  };
});

// --- Narración: cuándo empieza cada frase (texto en narracion.json) --------------------------------
const NARRACIONES: { id: string; escena: EscenaId; offsetSeg: number }[] = [
  { id: "quienes-1", escena: "quienes", offsetSeg: 0.6 },
  { id: "quienes-2", escena: "quienes", offsetSeg: 5.6 },
  { id: "talkback", escena: "talkback", offsetSeg: 0.3 },
  { id: "pruebas-1", escena: "pruebas", offsetSeg: 0.6 },
  { id: "pruebas-2", escena: "pruebas", offsetSeg: 10.5 },
  { id: "cierre", escena: "cierre", offsetSeg: 0.5 },
];

export const narraciones: Narracion[] = NARRACIONES.map((n) => ({
  id: n.id,
  escena: n.escena,
  inicio: escena(n.escena).inicio + s(n.offsetSeg),
}));

// --- Rótulos en pantalla -------------------------------------------------------------------------
const ROTULOS: { id: string; escena: EscenaId; texto: string; detalle?: string; desdeSeg: number; durSeg: number }[] = [
  { id: "equipo", escena: "quienes", texto: "Equipo de desarrollo", detalle: "Campus Navi", desdeSeg: 0.8, durSeg: 12 },
  { id: "talkback", escena: "talkback", texto: "Compatible con TalkBack", detalle: "Lector de pantalla de Android", desdeSeg: 0.5, durSeg: 17.5 },
  { id: "vuelta", escena: "pruebas", texto: "Una vuelta de 360°", desdeSeg: 1, durSeg: 7.5 },
  { id: "fotos", escena: "pruebas", texto: "5 fotos automáticas", desdeSeg: 9, durSeg: 8.5 },
  // Coincide con la toma u1-resultado (segundos 18–24 de la escena).
  { id: "resultado", escena: "pruebas", texto: "Te dice dónde estás", desdeSeg: 18.3, durSeg: 5.4 },
  { id: "responde", escena: "usuario3", texto: "La app responde por voz", desdeSeg: 0.8, durSeg: 10 },
];

export const rotulos: (Rotulo & { escena: EscenaId })[] = ROTULOS.map((r) => ({
  id: r.id,
  escena: r.escena,
  texto: r.texto,
  detalle: r.detalle,
  inicio: escena(r.escena).inicio + s(r.desdeSeg),
  duracion: s(r.durSeg),
}));
