"use client";

import { useAudio } from "./AudioProvider";

type Props = {
  src: string;
  /** Lo que se escucha, en minúscula: "paso 3", "el manual completo". Se muestra en el botón. */
  etiqueta: string;
  /** Detalle que solo lee el lector de pantalla, por ejemplo el título del paso. */
  descripcion?: string;
  /** Duración en segundos. */
  duracion?: number;
  grande?: boolean;
};

export function duracionEnPalabras(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  const min = m === 1 ? "1 minuto" : `${m} minutos`;
  const seg = s === 1 ? "1 segundo" : `${s} segundos`;
  if (m === 0) return seg;
  return s === 0 ? min : `${min} ${seg}`;
}

const reloj = (segundos: number) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

export function AudioButton({ src, etiqueta, descripcion, duracion, grande = false }: Props) {
  const { actual, estado, progreso, alternar } = useAudio();
  const esEste = actual === src;
  const sonando = esEste && (estado === "reproduciendo" || estado === "cargando");
  const fallo = esEste && estado === "error";

  const verbo = sonando ? "Pausar" : "Escuchar";
  const visible = `${verbo} ${etiqueta}`;
  const detalles = [descripcion, duracion ? duracionEnPalabras(duracion) : null].filter(Boolean).join(", ");
  const nombreAccesible = detalles ? `${visible}: ${detalles}` : visible;

  return (
    <div>
      {/* La duración va fuera del botón: así el texto visible del botón queda contenido en su nombre accesible
          (WCAG 2.5.3), y el lector de pantalla la oye en palabras dentro del nombre. */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => alternar(src, etiqueta)}
          aria-label={nombreAccesible}
          className={`group relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl text-left font-semibold text-white transition-colors sm:flex-none ${
            grande ? "min-h-16 px-6 text-xl" : "min-h-14 px-5 text-lg"
          } ${sonando ? "bg-violet-strong ring-2 ring-lilac" : "bg-violet hover:bg-violet-strong"}`}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-white/15 ${grande ? "h-10 w-10" : "h-8 w-8"}`}
            aria-hidden="true"
          >
            {sonando ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5" fill="currentColor">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
              </svg>
            )}
          </span>
          <span>{visible}</span>
          {esEste && progreso > 0 && (
            <span
              className="absolute bottom-0 left-0 h-1 bg-lilac"
              style={{ width: `${Math.round(progreso * 100)}%` }}
              aria-hidden="true"
            />
          )}
        </button>
        {duracion ? (
          <span className="shrink-0 text-base text-muted tabular-nums" aria-hidden="true">
            {reloj(duracion)}
          </span>
        ) : null}
      </div>

      {fallo && (
        <p className="mt-3 text-base text-danger">
          No se pudo reproducir aquí.{" "}
          <a href={src} className="font-semibold text-white underline underline-offset-4">
            Abrir el audio de {etiqueta} en MP3
          </a>
        </p>
      )}
      <noscript>
        <p className="mt-3">
          <a href={src} className="font-semibold text-white underline underline-offset-4">
            Abrir el audio de {etiqueta} en MP3
          </a>
        </p>
      </noscript>
    </div>
  );
}
