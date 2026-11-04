import type { Metadata } from "next";
import { StepSection } from "@/components/StepSection";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { AudioButton } from "@/components/audio/AudioButton";
import { AUDIO_COMPLETO, audioPaso, manualUsuario } from "@/content/usuario";
import { SITIO, openGraph } from "@/content/sitio";
import audios from "../../../public/audio/manifest.json";

const TITULO = "Manual para personas con discapacidad visual";
const DESCRIPCION = "Cómo saber dónde estás en el campus con Campus Navi, paso a paso, con TalkBack y audio.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  openGraph: openGraph(`${TITULO} · ${SITIO.nombre}`, DESCRIPCION, "/manual-usuario/"),
};

const duraciones: Record<string, number> = audios.duraciones;

export default function ManualUsuarioPage() {
  const { titulo, intro, comoUsar, pasos, cierre } = manualUsuario;
  return (
    <AudioProvider>
      <div className="mx-auto max-w-3xl px-5 py-12">
        <header>
          <h1 className="text-3xl font-bold leading-tight [overflow-wrap:anywhere] sm:text-5xl">{titulo}</h1>
          <p className="mt-5 text-xl leading-relaxed text-muted">{intro}</p>
          <div className="mt-8">
            <AudioButton
              src={AUDIO_COMPLETO}
              etiqueta="el manual completo"
              duracion={duraciones.completo}
              grande
            />
          </div>
        </header>

        <section
          aria-labelledby="como-usar"
          className="mt-10 rounded-3xl border border-violet bg-gradient-to-br from-violet-strong/30 to-surface p-6 sm:p-8"
        >
          <h2 id="como-usar" className="text-2xl font-bold">
            Cómo usar este manual
          </h2>
          <div className="mt-4 space-y-3 text-lg leading-relaxed">
            {comoUsar.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-8">
          {pasos.map((paso, i) => (
            <StepSection
              key={paso.id}
              paso={paso}
              indice={i}
              audio={
                <AudioButton
                  src={audioPaso(paso)}
                  etiqueta={`paso ${i + 1}`}
                  descripcion={paso.titulo}
                  duracion={duraciones[paso.id]}
                />
              }
            />
          ))}
        </div>

        <p className="mt-12 text-center text-xl font-semibold text-lilac">{cierre}</p>
      </div>
    </AudioProvider>
  );
}
