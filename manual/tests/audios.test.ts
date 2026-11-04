import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUDIO_COMPLETO, audioPaso, manualUsuario, narracionCompleta, narracionPaso } from "@/content/usuario";

const PUBLIC = join(__dirname, "..", "public");
const manifest = JSON.parse(readFileSync(join(PUBLIC, "audio", "manifest.json"), "utf-8")) as {
  voz: string;
  audios: Record<string, string>;
};
const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const MENSAJE = "Audio desactualizado: corre `.venv/Scripts/python scripts/generate_audio.py`";

function esMp3(ruta: string) {
  const b = readFileSync(ruta).subarray(0, 3);
  const id3 = b.toString("latin1") === "ID3";
  const frame = b[0] === 0xff && (b[1] & 0xe0) === 0xe0;
  return id3 || frame;
}

describe("audios del manual del usuario", () => {
  const casos = [
    ...manualUsuario.pasos.map((p, i) => ({ id: p.id, ruta: audioPaso(p), texto: narracionPaso(p, i) })),
    { id: "completo", ruta: AUDIO_COMPLETO, texto: narracionCompleta() },
  ];

  it.each(casos)("$ruta existe y es un MP3 con contenido", ({ ruta }) => {
    const archivo = join(PUBLIC, ruta);
    expect(existsSync(archivo)).toBe(true);
    expect(statSync(archivo).size).toBeGreaterThan(20_000);
    expect(esMp3(archivo)).toBe(true);
  });

  it.each(casos)("$ruta corresponde al texto actual", ({ id, texto }) => {
    expect(manifest.audios[id], MENSAJE).toBe(sha256(texto));
  });

  it("no hay audios sobrantes en el manifiesto", () => {
    expect(Object.keys(manifest.audios).sort()).toEqual(casos.map((c) => c.id).sort());
  });

  it("usa una voz en español de Colombia", () => {
    expect(manifest.voz).toMatch(/^es-CO-/);
  });
});
