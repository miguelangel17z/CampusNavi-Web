import { closeSync, existsSync, fstatSync, openSync, readSync } from "node:fs";
import { join } from "node:path";
// Si este import falla, falta public/video/: corre `npm run exportar` en ../video. Los 4 archivos se versionan.
import transcripcionJson from "../../public/video/campus-navi-transcripcion.json";
import { BotonVideo } from "./BotonVideo";

const VIDEO_ID = "video-campus-navi";

/** Archivos que exporta el proyecto del video (`manual_web/video`, `npm run exportar`) a `public/video/`. */
export const VIDEO = {
  mp4: "/video/campus-navi.mp4",
  poster: "/video/campus-navi-poster.jpg",
  vtt: "/video/campus-navi.vtt",
} as const;

export type EntradaTranscripcion = { segundo: number; tipo: "imagen" | "voz" | "sonido"; texto: string };

export const transcripcion = transcripcionJson as EntradaTranscripcion[];

const PREFIJO: Record<EntradaTranscripcion["tipo"], string> = {
  imagen: "Imagen:",
  voz: "Voz:",
  sonido: "Sonido:",
};

/**
 * Duración del MP4 en segundos, leída en el build de la caja `mvhd` (ISO BMFF) sin cargar el archivo entero.
 * Así la duración que se anuncia nunca se desfasa del video que se publica.
 */
export function duracionMp4(ruta: string): number {
  if (!existsSync(ruta)) {
    throw new Error(`Falta ${ruta}. Genera el video con \`npm run exportar\` en ../video (ver README, «Video de presentación»).`);
  }
  const fd = openSync(ruta, "r");
  try {
    const total = fstatSync(fd).size;
    const cab = Buffer.alloc(16);
    const leer = (pos: number, n: number) => {
      const b = n <= cab.length ? cab : Buffer.alloc(n);
      readSync(fd, b, 0, n, pos);
      return b;
    };
    /** Recorre las cajas entre `desde` y `hasta` y devuelve dónde empieza el contenido de la caja `tipo`. */
    const buscar = (tipo: string, desde: number, hasta: number) => {
      for (let pos = desde; pos + 8 <= hasta; ) {
        const b = leer(pos, 16);
        let tam = b.readUInt32BE(0);
        let cabecera = 8;
        if (tam === 1) {
          tam = Number(b.readBigUInt64BE(8));
          cabecera = 16;
        } else if (tam === 0) {
          tam = hasta - pos;
        }
        if (tam < cabecera) break;
        if (b.toString("latin1", 4, 8) === tipo) return { inicio: pos + cabecera, fin: pos + tam };
        pos += tam;
      }
      throw new Error(`${ruta}: no se encontró la caja "${tipo}"`);
    };
    const moov = buscar("moov", 0, total);
    const mvhd = buscar("mvhd", moov.inicio, moov.fin);
    const b = leer(mvhd.inicio, 32);
    const [escala, duracion] =
      b.readUInt8(0) === 1
        ? [b.readUInt32BE(20), Number(b.readBigUInt64BE(24))]
        : [b.readUInt32BE(12), b.readUInt32BE(16)];
    return duracion / escala;
  } finally {
    closeSync(fd);
  }
}

/** Segundos del video, redondeados. Se calcula una vez, al construir el sitio (o al correr las pruebas). */
export const DURACION_VIDEO = Math.round(duracionMp4(join(process.cwd(), "public", VIDEO.mp4)));

export function duracionEnPalabras(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  const min = m === 1 ? "1 minuto" : `${m} minutos`;
  const seg = s === 1 ? "1 segundo" : `${s} segundos`;
  if (m === 0) return seg;
  return s === 0 ? min : `${min} ${seg}`;
}

const reloj = (segundos: number) => `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, "0")}`;

/** Video de presentación con subtítulos en español y la transcripción completa debajo. */
export function PromoVideo({ className = "" }: { className?: string }) {
  const duracion = duracionEnPalabras(DURACION_VIDEO);
  return (
    <figure className={className}>
      <div className="mb-6">
        <BotonVideo videoId={VIDEO_ID} duracion={duracion} />
      </div>
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_20px_60px_-20px_rgb(124_77_255/0.5)]">
        <video
          id={VIDEO_ID}
          controls
          preload="metadata"
          playsInline
          poster={VIDEO.poster}
          width={1920}
          height={1080}
          aria-label={`Video de presentación de Campus Navi, ${duracion}`}
          aria-describedby="video-descripcion"
          className="block aspect-video h-auto w-full bg-night"
        >
          <source src={VIDEO.mp4} type="video/mp4" />
          <track kind="captions" src={VIDEO.vtt} srcLang="es" label="Español" default />
          <p>
            Tu navegador no puede reproducir este video.{" "}
            <a href={VIDEO.mp4} download>
              Descargar el video en MP4
            </a>
            .
          </p>
        </video>
      </div>
      <figcaption id="video-descripcion" className="mt-4 text-base text-muted">
        Dura {duracion} y tiene subtítulos en español. Debajo está la transcripción completa.
      </figcaption>

      <details className="group mt-4 rounded-3xl border border-line bg-surface">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-3 text-lg font-semibold text-lilac hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
          Leer la transcripción del video
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <ol className="space-y-3 border-t border-line px-6 py-5">
          {transcripcion.map((e) => (
            <li key={`${e.segundo}-${e.tipo}-${e.texto}`} className="flex gap-4 leading-relaxed">
              <time dateTime={`PT${e.segundo}S`} className="w-12 shrink-0 text-lilac tabular-nums">
                {reloj(e.segundo)}
              </time>
              <p className="text-muted">
                <span className="font-semibold text-white">{PREFIJO[e.tipo]}</span>{" "}
                {e.tipo === "voz" ? `«${e.texto}»` : e.texto}
              </p>
            </li>
          ))}
        </ol>
      </details>
    </figure>
  );
}
