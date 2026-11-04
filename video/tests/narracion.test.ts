import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  archivoNarracion,
  duracionNarracionFrames,
  frases,
  manifestNarracion,
  velocidadNarracion,
  vozNarracion,
} from "../src/narracion";
import { DURACION_TOTAL, escenas, narraciones, tramosOriginales } from "../src/timeline";
import { s } from "../src/tema";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
/** Margen al final de cada frase antes de lo que viene después (0,2 s). */
const MARGEN = 6;
/** La música se apaga en los últimos 2,5 s: el cierre debe terminar antes. */
const SALIDA_MUSICA = s(2.5);

// Copia de manual/tests/palabras.ts (funciones que no se pueden mencionar).
const PALABRAS_PROHIBIDAS =
  /\b(guiad\w*|gu[ií]a por voz|navegaci[oó]n|ir a un lugar|rutas?|destinos?|pr[oó]ximamente|llegada)\b/i;
const NOMBRES = ["Alejandro", "Miguel", "Emmanuel", "Jerónimo", "Jeronimo", "Mateo"];

const sha256 = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");

/** Último frame (exclusivo) hasta el que puede sonar la narración `i`. */
function limite(i: number): number {
  const n = narraciones[i];
  const e = escenas.find((x) => x.id === n.escena)!;
  const candidatos = [e.inicio + e.duracion];
  if (i + 1 < narraciones.length) candidatos.push(narraciones[i + 1].inicio);
  for (const o of tramosOriginales) if (o.inicio >= n.inicio) candidatos.push(o.inicio);
  if (n.id === "cierre") candidatos.push(DURACION_TOTAL - SALIDA_MUSICA);
  return Math.min(...candidatos);
}

describe("narración", () => {
  it("tiene las mismas frases y en el mismo orden que la línea de tiempo", () => {
    expect(frases.map((f) => f.id)).toEqual(narraciones.map((n) => n.id));
  });

  it("usa una voz de Colombia", () => {
    expect(vozNarracion).toMatch(/^es-CO-/);
    expect(manifestNarracion.voz).toBe(vozNarracion);
  });

  it.each(frases.map((f) => [f.id]))("%s: el MP3 existe y es un MP3 válido", (id) => {
    const ruta = join(PUBLIC, archivoNarracion(id));
    expect(existsSync(ruta), `falta ${ruta}: regenera con scripts/narracion.py`).toBe(true);
    expect(statSync(ruta).size).toBeGreaterThan(5 * 1024);
    const b = readFileSync(ruta).subarray(0, 3);
    const id3 = b.toString("latin1") === "ID3";
    const sync = b[0] === 0xff && (b[1] & 0xe0) === 0xe0;
    expect(id3 || sync, "cabecera MP3").toBe(true);
  });

  it.each(frases.map((f) => [f.id, f.texto]))("%s: el audio corresponde al texto actual", (id, texto) => {
    const m = manifestNarracion.frases[id];
    expect(m, `${id} no está en el manifiesto: regenera con scripts/narracion.py`).toBeDefined();
    expect(m.sha256, `el texto de «${id}» cambió: regenera con scripts/narracion.py`).toBe(sha256(texto));
  });

  it("el manifiesto usa la voz y la velocidad actuales", () => {
    const msg = "cambió la voz o la velocidad: regenera con scripts/narracion.py";
    expect(manifestNarracion.voz, msg).toBe(vozNarracion);
    expect(manifestNarracion.velocidad, msg).toBe(velocidadNarracion);
    // Nunca más rápido que la velocidad normal.
    expect(Number.parseInt(velocidadNarracion, 10)).toBeLessThanOrEqual(0);
  });

  it.each(narraciones.map((n, i) => [n.id, i]))("%s: cabe en su ventana", (id, i) => {
    const n = narraciones[i];
    const fin = n.inicio + duracionNarracionFrames(id) + MARGEN;
    const max = limite(i);
    expect(fin, `«${id}» sobra ${fin - max} frames (termina en ${fin}, límite ${max})`).toBeLessThanOrEqual(max);
  });

  it("ninguna narración se solapa con un tramo de audio original", () => {
    for (const n of narraciones) {
      const ini = n.inicio;
      const fin = n.inicio + duracionNarracionFrames(n.id);
      for (const o of tramosOriginales) {
        const solapa = ini < o.inicio + o.duracion && o.inicio < fin;
        expect(solapa, `${n.id} se solapa con ${o.toma}`).toBe(false);
      }
    }
  });

  it.each(frases.map((f) => [f.id, f.texto]))("%s: no menciona funciones prohibidas ni personas", (_id, texto) => {
    expect(texto).not.toMatch(PALABRAS_PROHIBIDAS);
    for (const nombre of NOMBRES) expect(texto.toLowerCase()).not.toContain(nombre.toLowerCase());
  });
});
