"use client";

import { useEffect, useState } from "react";

type Estado = "detenido" | "reproduciendo" | "pausado" | "error";

type Props = {
  /** id del <video> que controla. */
  videoId: string;
  /** Duración en palabras, para el nombre accesible («1 minuto 22 segundos»). */
  duracion: string;
};

/**
 * Botón grande para reproducir y pausar el video, pensado para TalkBack: un solo toque doble, sin tener que
 * encontrar los controles nativos del reproductor. Se mantiene sincronizado si se usan los controles del video.
 * Nunca reproduce solo. Anuncia pausa, fin y errores (no el inicio, para no hablar encima del video).
 */
export function BotonVideo({ videoId, duracion }: Props) {
  const [estado, setEstado] = useState<Estado>("detenido");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) return;
    const alReproducir = () => {
      setEstado("reproduciendo");
      setAviso("");
    };
    const alPausar = () => {
      if (video.ended) return;
      setEstado("pausado");
      setAviso("Video en pausa.");
    };
    const alTerminar = () => {
      setEstado("detenido");
      setAviso("Terminó el video.");
    };
    video.addEventListener("play", alReproducir);
    video.addEventListener("pause", alPausar);
    video.addEventListener("ended", alTerminar);
    return () => {
      video.removeEventListener("play", alReproducir);
      video.removeEventListener("pause", alPausar);
      video.removeEventListener("ended", alTerminar);
    };
  }, [videoId]);

  const alternar = () => {
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) return;
    if (estado === "reproduciendo") {
      video.pause();
      return;
    }
    video.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setEstado("error");
      setAviso("No se pudo reproducir el video. Puedes leer la transcripción más abajo.");
    });
  };

  const sonando = estado === "reproduciendo";
  const visible = sonando ? "Pausar video" : estado === "pausado" ? "Seguir viendo el video" : "Reproducir video";
  const nombre = sonando ? visible : `${visible}: presentación de Campus Navi, ${duracion}, con subtítulos`;

  return (
    <div>
      <button
        type="button"
        onClick={alternar}
        aria-label={nombre}
        aria-controls={videoId}
        className={`flex min-h-16 w-full items-center gap-4 rounded-2xl px-6 text-left text-xl font-semibold text-white transition-colors sm:w-auto ${
          sonando ? "bg-violet-strong ring-2 ring-lilac" : "bg-violet hover:bg-violet-strong"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
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
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </div>
  );
}
