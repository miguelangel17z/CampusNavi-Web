import type { Metadata } from "next";

/** Datos del sitio que comparten los metadatos, el ícono y la imagen para compartir. */
export const SITIO = {
  nombre: "Campus Navi",
  lema: "Accesibilidad y orientación para todos",
  descripcion:
    "Campus Navi te dice dónde estás dentro del campus con una vuelta de 360° y la cámara del celular. Manuales para personas con discapacidad visual y para administradores.",
} as const;

/**
 * URL pública para las etiquetas Open Graph (que exigen URL absoluta).
 * - `SITE_URL`: dominio propio, si se configura en Vercel.
 * - `VERCEL_PROJECT_PRODUCTION_URL`: la pone Vercel sola durante el build.
 * - En local queda `localhost:3000`, igual que `npx serve out`.
 * En los despliegues de vista previa Next usa la URL de la vista previa.
 */
export function urlDelSitio(env: Record<string, string | undefined> = process.env): URL {
  if (env.SITE_URL) return new URL(env.SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}

/** `public/opengraph.png`, generada con `node scripts/generate_iconos.mjs`. */
export const IMAGEN_OG = {
  url: "/opengraph.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${SITIO.nombre}: orbe violeta sobre fondo azul noche y el lema «${SITIO.lema}».`,
} as const;

/**
 * Open Graph de una página. Cada página lo declara completo porque Next reemplaza
 * (no mezcla) el objeto `openGraph` del layout cuando la página define el suyo.
 */
export function openGraph(titulo: string, descripcion: string, ruta: string): Metadata["openGraph"] {
  return {
    type: "website",
    locale: "es_CO",
    siteName: SITIO.nombre,
    title: titulo,
    description: descripcion,
    url: ruta,
    images: [IMAGEN_OG],
  };
}
