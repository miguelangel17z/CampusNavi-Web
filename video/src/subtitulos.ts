/**
 * Subtítulos (WebVTT) y transcripción del video, generados desde la línea de tiempo y la narración.
 * Funciones puras: las usa scripts/exportar.ts y las prueba tests/subtitulos.test.ts.
 */
import { duracionNarracionFrames, frases } from "./narracion";
import { escenas, narraciones, tramosOriginales, type EscenaId } from "./timeline";
import { FPS } from "./tema";

export type Cue = { inicio: number; fin: number; texto: string };

/** Qué se ve en cada escena (para la transcripción con descripción de imagen). */
export const DESCRIPCION_ESCENAS: Record<EscenaId, string> = {
  intro: "Aparece el logo de Campus Navi, un pin de ubicación con una órbita, y el lema «Accesibilidad y orientación para todos».",
  quienes: "El equipo de desarrollo le explica la app a un usuario con discapacidad visual en el campus.",
  talkback: "Grabación de la pantalla del celular con TalkBack activo sobre la pantalla de inicio de la app y luego el escaneo.",
  pruebas: "Una usuaria y un usuario con bastón sostienen el celular frente a ellos y giran despacio sobre su lugar. Al final, la usuaria escucha el resultado en el celular.",
  usuario3: "Una usuaria acerca el celular al oído para escuchar la respuesta de la app.",
  cierre: "Logo de Campus Navi, el lema y la firma «Equipo de desarrollo Campus Navi».",
};

const textoDe = (id: string) => {
  const f = frases.find((x) => x.id === id);
  if (!f) throw new Error(`Falta el texto de la narración «${id}»`);
  return f.texto;
};

/** Cues ordenados: narración + tramos con audio original. Frames del video final. */
export function cues(): Cue[] {
  const lista: Cue[] = [
    ...narraciones.map((n) => ({
      inicio: n.inicio,
      fin: n.inicio + duracionNarracionFrames(n.id),
      texto: textoDe(n.id),
    })),
    ...tramosOriginales.map((o) => ({ inicio: o.inicio, fin: o.inicio + o.duracion, texto: o.subtitulo })),
  ];
  return lista.sort((a, b) => a.inicio - b.inicio);
}

/** 75 frames → "00:00:02.500" */
export function tiempoVtt(frames: number): string {
  const ms = Math.round((frames / FPS) * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const sg = Math.floor((ms % 60_000) / 1000);
  const r = ms % 1000;
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(h)}:${p(m)}:${p(sg)}.${p(r, 3)}`;
}

export function generarVtt(lista: Cue[] = cues()): string {
  const bloques = lista.map((c, i) => `${i + 1}\n${tiempoVtt(c.inicio)} --> ${tiempoVtt(c.fin)}\n${c.texto}`);
  return `WEBVTT\n\n${bloques.join("\n\n")}\n`;
}

export type EntradaTranscripcion = { segundo: number; tipo: "imagen" | "voz" | "sonido"; texto: string };

/** Transcripción para la página: descripción de cada escena seguida de lo que se oye en ella. */
export function transcripcion(): EntradaTranscripcion[] {
  const lista = cues();
  return escenas.flatMap((e) => {
    const fin = e.inicio + e.duracion;
    const sonidos = lista
      .filter((c) => c.inicio >= e.inicio && c.inicio < fin)
      .map((c) => ({
        segundo: Math.floor(c.inicio / FPS),
        tipo: (c.texto.startsWith("[") ? "sonido" : "voz") as EntradaTranscripcion["tipo"],
        texto: c.texto.replace(/^\[|\]$/g, ""),
      }));
    return [{ segundo: Math.floor(e.inicio / FPS), tipo: "imagen" as const, texto: DESCRIPCION_ESCENAS[e.id] }, ...sonidos];
  });
}
