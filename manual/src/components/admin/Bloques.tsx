import Image from "next/image";
import { PhoneScreenshot } from "../PhoneScreenshot";
import { capturas } from "@/content/capturas";
import type { Bloque } from "@/content/admin";

export function Pasos({ items }: { items: string[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={item} className="flex gap-4">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet text-sm font-bold text-white"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <span className="pt-0.5 leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Aviso({ variante, titulo, texto }: { variante: "info" | "peligro"; titulo: string; texto: string }) {
  const peligro = variante === "peligro";
  return (
    <div
      className={`rounded-2xl border-l-4 p-5 ${peligro ? "border-danger bg-danger/10" : "border-violet bg-surface-2"}`}
    >
      <p className={`flex items-center gap-2 font-semibold ${peligro ? "text-danger" : "text-lilac"}`}>
        <span aria-hidden="true">{peligro ? "⚠" : "ℹ"}</span>
        <span>
          <span className="sr-only">{peligro ? "Atención: " : "Nota: "}</span>
          {titulo}
        </span>
      </p>
      <p className="mt-2 leading-relaxed">{texto}</p>
    </div>
  );
}

export function CapturaPendiente({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div
      data-captura-pendiente
      className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line bg-surface/60 px-6 py-10 text-center"
    >
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-lilac" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      <p className="font-semibold text-lilac">{titulo}</p>
      <p className="max-w-md text-muted">{texto}</p>
    </div>
  );
}

export function Figura({ ids, pie, ancha }: { ids: (keyof typeof capturas)[]; pie: string; ancha?: boolean }) {
  return (
    <figure className="rounded-3xl border border-line bg-surface/60 p-6">
      {ancha ? (
        ids.map((id) => {
          const c = capturas[id];
          return (
            <Image
              key={id}
              src={c.src}
              width={c.width}
              height={c.height}
              alt={c.alt}
              loading="lazy"
              className="h-auto w-full rounded-2xl"
            />
          );
        })
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {ids.map((id) => (
            <PhoneScreenshot key={id} id={id} className="w-52 sm:w-60" />
          ))}
        </div>
      )}
      <figcaption className="mt-4 text-center text-sm text-muted">{pie}</figcaption>
    </figure>
  );
}

export function RenderBloque({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case "parrafo":
      return <p className="leading-relaxed">{bloque.texto}</p>;
    case "subtitulo":
      return (
        <h3 id={bloque.id} className="pt-4 text-xl font-semibold text-white">
          {bloque.texto}
        </h3>
      );
    case "pasos":
      return <Pasos items={bloque.items} />;
    case "lista":
      return (
        <ul className="space-y-3">
          {bloque.items.map((item) => (
            <li key={item.termino} className="rounded-2xl border border-line bg-surface px-5 py-4">
              {item.enlace ? (
                // min-h-12 da un objetivo táctil de 48 px; -my-3 evita que la tarjeta crezca.
                <a
                  href={item.enlace}
                  className="-my-3 inline-flex min-h-12 items-center font-semibold text-lilac underline-offset-4 hover:underline"
                >
                  {item.termino}
                </a>
              ) : (
                <span className="font-semibold text-white">{item.termino}</span>
              )}
              <span className="text-muted">: {item.texto}</span>
            </li>
          ))}
        </ul>
      );
    case "figura":
      return <Figura ids={bloque.capturas} pie={bloque.pie} ancha={bloque.ancha} />;
    case "aviso":
      return <Aviso variante={bloque.variante} titulo={bloque.titulo} texto={bloque.texto} />;
    case "pendiente":
      return <CapturaPendiente titulo={bloque.titulo} texto={bloque.texto} />;
  }
}
