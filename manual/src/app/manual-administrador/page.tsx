import type { Metadata } from "next";
import { RenderBloque } from "@/components/admin/Bloques";
import { manualAdmin } from "@/content/admin";
import { SITIO, openGraph } from "@/content/sitio";

const TITULO = "Manual del administrador y recolector";
const DESCRIPCION =
  "Guía paso a paso del panel de administración de Campus Navi: recolección, lugares, imágenes y mapa.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  openGraph: openGraph(`${TITULO} · ${SITIO.nombre}`, DESCRIPCION, "/manual-administrador/"),
};

export default function ManualAdministradorPage() {
  const { titulo, intro, secciones } = manualAdmin;
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-lilac">Campus Navi · Panel de administración</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{titulo}</h1>
        <p className="mt-5 text-xl leading-relaxed text-muted">{intro}</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Contenido del manual" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted" aria-hidden="true">
            Contenido
          </p>
          <ol className="space-y-1 rounded-3xl border border-line bg-surface p-3">
            {secciones.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-muted transition-colors hover:bg-surface-2 hover:text-white"
                >
                  <span className="text-sm font-bold text-lilac tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-16">
          {secciones.map((s, i) => (
            <article key={s.id} aria-labelledby={s.id} className="max-w-3xl">
              <p className="text-sm font-bold text-lilac tabular-nums" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 id={s.id} className="mt-1 text-3xl font-bold">
                {s.titulo}
              </h2>
              <p className="mt-2 text-lg text-muted">{s.resumen}</p>
              <div className="mt-6 space-y-6 text-lg">
                {s.bloques.map((b, j) => (
                  <RenderBloque key={j} bloque={b} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
