import { describe, expect, it } from "vitest";
import {
  MUSICA_DESDE_SEG,
  VOL_CLIP_BAJO,
  VOL_MUSICA,
  VOL_MUSICA_BAJA,
  volumenClip,
  volumenMusica,
} from "../src/mezcla";
import { DURACION_TOTAL, tomas, tramosOriginales } from "../src/timeline";
import { s } from "../src/tema";

describe("música", () => {
  it("empieza en el minuto 1:00 de la canción", () => {
    expect(MUSICA_DESDE_SEG).toBe(60);
  });

  it("sube de 0 a 40 % en 7 segundos", () => {
    expect(volumenMusica(0)).toBe(0);
    expect(volumenMusica(s(3.5))).toBeCloseTo(0.2, 2);
    expect(volumenMusica(s(7))).toBeCloseTo(0.4, 5);
    expect(VOL_MUSICA).toBe(0.4);
  });

  it("se mantiene al 40 % fuera de los tramos originales", () => {
    expect(volumenMusica(s(12))).toBeCloseTo(0.4, 5);
  });

  it("baja a ≈ 12 % en los tramos con audio original", () => {
    expect(VOL_MUSICA_BAJA).toBeCloseTo(0.12, 5);
    for (const o of tramosOriginales) {
      const medio = o.inicio + Math.floor(o.duracion / 2);
      expect(volumenMusica(medio), o.toma).toBeCloseTo(0.12, 3);
    }
  });

  it("se apaga al final", () => {
    expect(volumenMusica(DURACION_TOTAL - 1)).toBeLessThan(0.02);
    expect(volumenMusica(DURACION_TOTAL - s(4))).toBeCloseTo(0.4, 3);
  });

  it("nunca supera el 40 % ni baja de 0", () => {
    for (let f = 0; f < DURACION_TOTAL; f += 5) {
      const v = volumenMusica(f);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(0.4 + 1e-9);
    }
  });
});

describe("audio de los clips", () => {
  it("queda casi en silencio fuera de los tramos originales", () => {
    expect(VOL_CLIP_BAJO).toBe(0.03);
    const u1 = tomas.find((t) => t.clip === "usuario1")!;
    expect(volumenClip(u1.id, u1.inicio + 10)).toBe(0.03);
  });

  it("suena al 100 % dentro de los tramos originales", () => {
    for (const o of tramosOriginales) {
      expect(volumenClip(o.toma, o.inicio + Math.floor(o.duracion / 2))).toBe(1);
    }
  });

  it("la entrada al tramo original es gradual", () => {
    const o = tramosOriginales[0];
    const v = volumenClip(o.toma, o.inicio + 2);
    expect(v).toBeGreaterThan(0.03);
    expect(v).toBeLessThan(1);
  });
});
