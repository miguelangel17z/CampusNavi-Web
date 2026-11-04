import { describe, expect, it } from "vitest";
import { material } from "../src/material";
import { DURACION_TOTAL, escenas, tomas, tramosOriginales, narraciones, rotulos } from "../src/timeline";
import { FIRMA, FPS, LEMA } from "../src/tema";

const seg = (frames: number) => frames / FPS;

describe("línea de tiempo", () => {
  it("dura entre 60 y 90 segundos", () => {
    expect(seg(DURACION_TOTAL)).toBeGreaterThanOrEqual(60);
    expect(seg(DURACION_TOTAL)).toBeLessThanOrEqual(90);
  });

  it("tiene las escenas en el orden del storyboard, sin huecos ni solapes", () => {
    expect(escenas.map((e) => e.id)).toEqual(["intro", "quienes", "talkback", "pruebas", "usuario3", "cierre"]);
    let cursor = 0;
    for (const e of escenas) {
      expect(e.inicio, e.id).toBe(cursor);
      expect(e.duracion, e.id).toBeGreaterThan(0);
      cursor += e.duracion;
    }
    expect(cursor).toBe(DURACION_TOTAL);
  });

  it("cada toma cabe dentro de su escena y de la duración real del clip", () => {
    for (const t of tomas) {
      const e = escenas.find((x) => x.id === t.escena)!;
      expect(t.inicio, t.id).toBeGreaterThanOrEqual(e.inicio);
      expect(t.inicio + t.duracion, t.id).toBeLessThanOrEqual(e.inicio + e.duracion);
      expect(t.desde, t.id).toBeGreaterThanOrEqual(0);
      expect(t.hasta, t.id).toBeLessThanOrEqual(material[t.clip].duracionSeg);
      expect(t.hasta, t.id).toBeGreaterThan(t.desde);
    }
  });

  it("las tomas de una escena son consecutivas", () => {
    for (const e of escenas) {
      const propias = tomas.filter((t) => t.escena === e.id);
      for (let i = 1; i < propias.length; i++) {
        expect(propias[i].inicio).toBe(propias[i - 1].inicio + propias[i - 1].duracion);
      }
    }
  });

  it("respeta los tramos que indicó Miguel", () => {
    const de = (clip: string) => tomas.filter((t) => t.clip === clip);
    // Usuario 2: explicación del equipo antes de 0:50; la prueba, después de 0:50.
    const u2 = de("usuario2");
    expect(u2.find((t) => t.escena === "quienes")!.hasta).toBeLessThanOrEqual(50);
    expect(u2.filter((t) => t.escena === "pruebas").every((t) => t.desde >= 50)).toBe(true);
    // Usuario 1: después del segundo 6, y su última toma es el final del clip (el resultado).
    const u1 = de("usuario1");
    expect(u1.every((t) => t.desde >= 6)).toBe(true);
    expect(u1.at(-1)!.hasta).toBeGreaterThanOrEqual(material.usuario1.duracionSeg - 1);
    // TalkBack con audio original de 0:49 a 1:02; Usuario 3 de 0:19 a 0:29.
    expect(tramosOriginales.map((o) => [o.clip, o.desdeSeg, o.hastaSeg])).toEqual([
      ["talkback", 49, 62],
      ["usuario3", 19, 29],
    ]);
  });

  it("los tramos originales quedan dentro de su toma", () => {
    for (const o of tramosOriginales) {
      const t = tomas.find((x) => x.id === o.toma)!;
      expect(o.desdeSeg).toBeGreaterThanOrEqual(t.desde);
      expect(o.hastaSeg).toBeLessThanOrEqual(t.hasta);
      expect(o.inicio).toBe(t.inicio + Math.round((o.desdeSeg - t.desde) * FPS));
    }
  });

  it("el rótulo del resultado aparece sobre la toma del resultado", () => {
    const r = rotulos.find((x) => x.id === "resultado")!;
    const t = tomas.find((x) => x.id === "u1-resultado")!;
    expect(r.inicio).toBeGreaterThanOrEqual(t.inicio);
    expect(r.inicio + r.duracion).toBeLessThanOrEqual(t.inicio + t.duracion);
  });

  it("los textos en pantalla no mencionan funciones que no existen ni nombres de personas", () => {
    const textos = [...rotulos.flatMap((r) => [r.texto, r.detalle ?? ""]), LEMA, FIRMA].join(" ");
    expect(textos).not.toMatch(/\b(guiad\w*|gu[ií]a por voz|navegaci[oó]n|ir a un lugar|rutas?|destinos?|pr[oó]ximamente|llegada)\b/i);
    expect(textos).not.toMatch(/Alejandro|Miguel|Emmanuel|Jer[oó]nimo|Mateo/);
  });

  it("el Usuario 3 con audio original es lo último antes del cierre", () => {
    const u3 = escenas.find((e) => e.id === "usuario3")!;
    const cierre = escenas.find((e) => e.id === "cierre")!;
    expect(u3.inicio + u3.duracion).toBe(cierre.inicio);
  });

  it("ninguna narración arranca dentro de un tramo con audio original", () => {
    for (const n of narraciones) {
      for (const o of tramosOriginales) {
        expect(n.inicio >= o.inicio && n.inicio < o.inicio + o.duracion, n.id).toBe(false);
      }
    }
  });
});
