/**
 * Exporta el video y lo copia al sitio.
 *   npm run exportar            → render + póster + subtítulos + transcripción + copia a ../manual/public/video/
 *   npm run exportar -- --sin-render   → solo póster, subtítulos y transcripción (reusa out/campus-navi.mp4)
 *   npm run exportar -- --sin-copiar   → no copia al sitio
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generarVtt, transcripcion } from "../src/subtitulos";
import { DURACION_TOTAL, escena } from "../src/timeline";
import { FPS } from "../src/tema";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(RAIZ, "out");
const SITIO = join(RAIZ, "..", "manual", "public", "video");
const MAX_MB = 20;
const args = new Set(process.argv.slice(2));

function correr(cmd: string, a: string[]) {
  console.log(`\n> ${cmd} ${a.join(" ")}`);
  const r = spawnSync(cmd, a, { cwd: RAIZ, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error(`Falló: ${cmd} ${a.join(" ")}`);
}

mkdirSync(OUT, { recursive: true });
const mp4 = join(OUT, "campus-navi.mp4");
const poster = join(OUT, "campus-navi-poster.jpg");

if (!args.has("--sin-render")) {
  correr("npx", ["remotion", "render", "src/index.ts", "CampusNaviPromo", mp4, "--crf=28", "--audio-codec=aac"]);
}
if (!existsSync(mp4)) throw new Error("No existe out/campus-navi.mp4");

// Póster: la intro ya armada (logo, título y lema).
const framePoster = escena("intro").inicio + 130;
correr("npx", ["remotion", "still", "src/index.ts", "CampusNaviPromo", poster, `--frame=${framePoster}`, "--image-format=jpeg", "--jpeg-quality=85"]);

writeFileSync(join(OUT, "campus-navi.vtt"), generarVtt(), "utf-8");
writeFileSync(join(OUT, "campus-navi-transcripcion.json"), JSON.stringify(transcripcion(), null, 2) + "\n", "utf-8");

const mb = statSync(mp4).size / 1024 / 1024;
console.log(`\nVideo: ${mb.toFixed(1)} MB, ${(DURACION_TOTAL / FPS).toFixed(1)} s`);
if (mb > MAX_MB) throw new Error(`El MP4 pesa ${mb.toFixed(1)} MB (máximo ${MAX_MB}). Sube --crf.`);

if (!args.has("--sin-copiar")) {
  mkdirSync(SITIO, { recursive: true });
  for (const f of ["campus-navi.mp4", "campus-navi-poster.jpg", "campus-navi.vtt", "campus-navi-transcripcion.json"]) {
    copyFileSync(join(OUT, f), join(SITIO, f));
  }
  console.log(`Copiado a ${SITIO}`);
}
