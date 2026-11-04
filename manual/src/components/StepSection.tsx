import type { ReactNode } from "react";
import { PhoneScreenshot } from "./PhoneScreenshot";
import type { Paso } from "@/content/usuario";

type Props = {
  paso: Paso;
  indice: number;
  /** Botón de audio del paso (se inyecta desde la página). */
  audio?: ReactNode;
};

/** Un paso del manual del usuario: un `h2` por paso para que TalkBack pueda saltar entre ellos. */
export function StepSection({ paso, indice, audio }: Props) {
  const headingId = `paso-${paso.id}`;
  return (
    <section aria-labelledby={headingId} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <h2 id={headingId} className="text-2xl font-bold sm:text-3xl">
        <span className="text-lilac">Paso {indice + 1}.</span> {paso.titulo}
      </h2>

      {audio && <div className="mt-5">{audio}</div>}

      <div className="mt-5 space-y-4 text-lg leading-relaxed sm:text-xl">
        {paso.parrafos.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {paso.lista && (
          <ul className="list-disc space-y-2 pl-6 marker:text-lilac">
            {paso.lista.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {paso.despues?.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {paso.oiras && (
        <div className="mt-6 rounded-2xl border-l-4 border-violet bg-surface-2 p-5">
          <p className="font-semibold text-lilac">Lo que vas a oír:</p>
          <ul className="mt-2 space-y-1 text-lg italic">
            {paso.oiras.map((frase) => (
              <li key={frase}>«{frase}»</li>
            ))}
          </ul>
        </div>
      )}

      {paso.capturas && (
        <figure className="mt-8">
          <div className="flex flex-wrap justify-center gap-6">
            {paso.capturas.map((id) => (
              <PhoneScreenshot key={id} id={id} className="w-48 sm:w-56" />
            ))}
          </div>
          <figcaption className="mt-4 text-center text-sm text-muted">
            {paso.capturas.length > 1 ? "Capturas de la app" : "Captura de la app"}, para quien te acompaña.
          </figcaption>
        </figure>
      )}
    </section>
  );
}
