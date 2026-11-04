/**
 * Material original (public/material/, fuera de git). Medido con `npx remotion ffprobe` el 2026-11-04.
 * Todos los clips son verticales: se muestran centrados sobre una copia desenfocada.
 */
export type Material = {
  archivo: string;
  duracionSeg: number;
  ancho?: number;
  alto?: number;
  descripcion: string;
};

export const material = {
  usuario1: {
    archivo: "material/usuario1.mp4",
    duracionSeg: 56.65,
    ancho: 478,
    alto: 850,
    descripcion: "Usuaria da la vuelta de 360° (después del segundo 6) y termina escuchando el resultado.",
  },
  usuario2: {
    archivo: "material/usuario2.mp4",
    duracionSeg: 114.71,
    ancho: 478,
    alto: 850,
    descripcion: "0:00–0:50 el equipo explica la app; desde 0:50 el usuario la prueba.",
  },
  usuario3: {
    archivo: "material/usuario3.mp4",
    duracionSeg: 42.83,
    ancho: 478,
    alto: 850,
    descripcion: "Usuaria probando; de 0:19 a 0:29 se oye cómo responde la app (audio original).",
  },
  talkback: {
    archivo: "material/talkback.mp4",
    duracionSeg: 118.31,
    ancho: 512,
    alto: 1328,
    descripcion: "Grabación de pantalla con TalkBack; de 0:49 a 1:02 se oye TalkBack (audio original).",
  },
  musica: {
    archivo: "material/musica.mp3",
    duracionSeg: 470.12,
    descripcion: "Our Odyssey. Se usa desde el minuto 1:00.",
  },
} satisfies Record<string, Material>;

export type MaterialId = keyof typeof material;
export type ClipId = Exclude<MaterialId, "musica">;
