import Link from "next/link";
import { PhoneScreenshot } from "@/components/PhoneScreenshot";
import type { CapturaId } from "@/content/capturas";

const pasos: { titulo: string; texto: string; captura: CapturaId }[] = [
  {
    titulo: "Di «uno»",
    texto: "Al abrir la app, el orbe te escucha. Di «uno» o toca dos veces el botón grande del centro.",
    captura: "inicioUsuario",
  },
  {
    titulo: "Da una vuelta",
    texto:
      "Con el celular de pie frente a ti, gira despacio hacia la derecha. La app toma cinco fotos sola, con una vibración en cada una.",
    captura: "escaneoInicio",
  },
  {
    titulo: "Escucha dónde estás",
    texto: "La app compara las fotos con imágenes del campus y te dice en voz alta el lugar más cercano.",
    captura: "resultado",
  },
];

const accesibilidad = [
  {
    titulo: "Funciona con TalkBack",
    texto: "Cada botón tiene nombre y se puede usar con el lector de pantalla de Android.",
  },
  {
    titulo: "Se controla con la voz",
    texto: "No hace falta leer la pantalla: la app habla y escucha.",
  },
  {
    titulo: "Avisa mientras escaneas",
    texto: "Vibra y suena en cada foto, y te dice «Más despacio» o «Mantén el celular vertical» si hace falta.",
  },
  {
    titulo: "Sin tomar fotos a mano",
    texto: "El sensor de orientación decide cuándo capturar, cada quinto de vuelta.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Presentación */}
      <section aria-labelledby="titulo-inicio" className="grid items-center gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-lilac">
            <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
            App Android · Universidad EAFIT
          </p>
          <h1 id="titulo-inicio" className="text-5xl font-bold tracking-tight sm:text-6xl">
            Campus <span className="text-lilac">Navi</span>
          </h1>
          <p className="mt-4 text-2xl font-medium text-lilac">Accesibilidad y orientación para todos</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Campus Navi le dice a una persona con discapacidad visual dónde está dentro del campus. Basta con dar una
            vuelta completa con el celular: la app toma cinco fotos, las compara con imágenes del campus y responde en
            voz alta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/manual-usuario"
              className="flex min-h-14 items-center justify-center rounded-2xl bg-violet px-6 text-lg font-semibold text-white transition-colors hover:bg-violet-strong"
            >
              Manual de usuario
            </Link>
            <Link
              href="/manual-administrador"
              className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-violet px-6 text-lg font-semibold text-lilac transition-colors hover:bg-surface-2"
            >
              Manual de administrador
            </Link>
          </div>
        </div>
        <div className="relative mx-auto flex items-center justify-center">
          <div className="orb absolute h-72 w-72 opacity-60 blur-2xl" aria-hidden="true" />
          <PhoneScreenshot id="inicioUsuario" className="relative w-60 sm:w-64" eager />
        </div>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="titulo-como" className="py-16">
        <h2 id="titulo-como" className="text-3xl font-bold sm:text-4xl">
          Cómo funciona
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-muted">Tres pasos, sin mirar la pantalla.</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {pasos.map((paso, i) => (
            <li key={paso.titulo} className="flex flex-col rounded-3xl border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="text-xl font-semibold">{paso.titulo}</h3>
              </div>
              <p className="mt-3 flex-1 leading-relaxed text-muted">{paso.texto}</p>
              <PhoneScreenshot id={paso.captura} className="mx-auto mt-6 w-44" />
            </li>
          ))}
        </ol>
      </section>

      {/* Accesibilidad */}
      <section aria-labelledby="titulo-accesible" className="py-16">
        <h2 id="titulo-accesible" className="text-3xl font-bold sm:text-4xl">
          Hecha para usarse sin ver
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {accesibilidad.map((item) => (
            <li key={item.titulo} className="rounded-3xl border border-line bg-surface p-6">
              <h3 className="text-lg font-semibold text-white">{item.titulo}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Manuales */}
      <section aria-labelledby="titulo-manuales" className="py-16">
        <h2 id="titulo-manuales" className="text-3xl font-bold sm:text-4xl">
          Manuales
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-violet bg-gradient-to-br from-violet-strong/40 to-surface p-8">
            <h3 className="text-2xl font-semibold">Para personas con discapacidad visual</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              Paso a paso para saber dónde estás. Se puede leer con TalkBack y cada paso trae su audio.
            </p>
            <Link
              href="/manual-usuario"
              className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-violet px-5 font-semibold text-white hover:bg-violet-strong"
            >
              Abrir el manual de usuario
            </Link>
          </article>
          <article className="flex flex-col rounded-3xl border border-line bg-surface p-8">
            <h3 className="text-2xl font-semibold">Para administradores y recolectores</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              Cómo entrar al panel, recolectar imágenes del campus y administrar lugares, fotos y el mapa.
            </p>
            <Link
              href="/manual-administrador"
              className="mt-6 flex min-h-12 items-center justify-center rounded-2xl border-2 border-violet px-5 font-semibold text-lilac hover:bg-surface-2"
            >
              Abrir el manual de administrador
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
