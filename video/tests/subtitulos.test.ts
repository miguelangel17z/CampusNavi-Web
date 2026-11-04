import { describe, expect, it } from "vitest";
import { cues, generarVtt, tiempoVtt, transcripcion } from "../src/subtitulos";
import { DURACION_TOTAL, escenas, narraciones, tramosOriginales } from "../src/timeline";

const PROHIBIDAS = /\b(guiad\w*|gu[ií]a por voz|navegaci[oó]n|ir a un lugar|rutas?|destinos?|pr[oó]ximamente|llegada)\b/i;

describe("subtítulos", () => {
  it("formatea tiempos WebVTT", () => {
    expect(tiempoVtt(0)).toBe("00:00:00.000");
    expect(tiempoVtt(75)).toBe("00:00:02.500");
    expect(tiempoVtt(2460)).toBe("00:01:22.000");
  });

  it("tiene un cue por narración y por tramo con audio original", () => {
    expect(cues()).toHaveLength(narraciones.length + tramosOriginales.length);
    const textos = cues().map((c) => c.texto);
    expect(textos).toContain("[TalkBack hablando]");
    expect(textos).toContain("[La app responde por voz]");
  });

  it("los cues van en orden, no se solapan y caben en el video", () => {
    const lista = cues();
    for (let i = 0; i < lista.length; i++) {
      expect(lista[i].fin).toBeGreaterThan(lista[i].inicio);
      expect(lista[i].fin).toBeLessThanOrEqual(DURACION_TOTAL);
      if (i > 0) expect(lista[i].inicio).toBeGreaterThanOrEqual(lista[i - 1].fin);
    }
  });

  it("genera un WebVTT válido", () => {
    const vtt = generarVtt();
    expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
    const tiempos = [...vtt.matchAll(/^(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})$/gm)];
    expect(tiempos).toHaveLength(cues().length);
    expect(vtt.endsWith("\n")).toBe(true);
  });

  it("la transcripción describe cada escena y no menciona funciones prohibidas ni nombres", () => {
    const t = transcripcion();
    expect(t.filter((e) => e.tipo === "imagen")).toHaveLength(escenas.length);
    expect(t.filter((e) => e.tipo === "voz")).toHaveLength(narraciones.length);
    expect(t.filter((e) => e.tipo === "sonido")).toHaveLength(tramosOriginales.length);
    const todo = t.map((e) => e.texto).join(" ");
    expect(todo).not.toMatch(PROHIBIDAS);
    expect(todo).not.toMatch(/Alejandro|Miguel|Emmanuel|Jer[oó]nimo|Mateo/);
    expect(generarVtt()).not.toMatch(PROHIBIDAS);
  });
});
