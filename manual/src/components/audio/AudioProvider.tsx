"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type EstadoAudio = "inactivo" | "cargando" | "reproduciendo" | "pausado" | "error";

type AudioCtx = {
  /** Audio cargado en el reproductor (solo hay uno para toda la página). */
  actual: string | null;
  estado: EstadoAudio;
  /** Avance de 0 a 1 del audio actual. */
  progreso: number;
  alternar: (src: string, nombre: string) => void;
};

const Contexto = createContext<AudioCtx | null>(null);

export function useAudio() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAudio debe usarse dentro de <AudioProvider>");
  return ctx;
}

/**
 * Un único reproductor para la página: al iniciar un audio se detiene el anterior.
 * Nunca reproduce solo; siempre responde a una acción de la persona.
 * Anuncia pausa, fin y errores en una región `aria-live` (el inicio no se anuncia
 * para que TalkBack no hable encima del audio).
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nombreRef = useRef("");
  const [actual, setActual] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoAudio>("inactivo");
  const [progreso, setProgreso] = useState(0);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const alTerminar = () => {
      setEstado("inactivo");
      setProgreso(0);
      setAviso(`Terminó el audio de ${nombreRef.current}.`);
    };
    const alFallar = () => {
      if (!audio.getAttribute("src")) return;
      setEstado("error");
      setAviso(`No se pudo reproducir el audio de ${nombreRef.current}.`);
    };
    const alAvanzar = () => setProgreso(audio.duration ? audio.currentTime / audio.duration : 0);

    audio.addEventListener("ended", alTerminar);
    audio.addEventListener("error", alFallar);
    audio.addEventListener("timeupdate", alAvanzar);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", alTerminar);
      audio.removeEventListener("error", alFallar);
      audio.removeEventListener("timeupdate", alAvanzar);
      audioRef.current = null;
    };
  }, []);

  const alternar = useCallback(
    (src: string, nombre: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (actual === src && (estado === "reproduciendo" || estado === "cargando")) {
        audio.pause();
        setEstado("pausado");
        setAviso(`En pausa: ${nombre}.`);
        return;
      }

      if (actual !== src) {
        audio.pause();
        audio.src = src;
        setActual(src);
        setProgreso(0);
      }
      nombreRef.current = nombre;
      setAviso("");
      setEstado("cargando");
      audio
        .play()
        .then(() => setEstado("reproduciendo"))
        .catch((e: unknown) => {
          // Cambiar de audio interrumpe la reproducción anterior: no es un error.
          if (e instanceof DOMException && e.name === "AbortError") return;
          setEstado("error");
          setAviso(`No se pudo reproducir el audio de ${nombre}.`);
        });
    },
    [actual, estado],
  );

  return (
    <Contexto.Provider value={{ actual, estado, progreso, alternar }}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
    </Contexto.Provider>
  );
}
