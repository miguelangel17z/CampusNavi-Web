import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SkipLink } from "@/components/SkipLink";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITIO, openGraph, urlDelSitio } from "@/content/sitio";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const TITULO = `${SITIO.nombre} · ${SITIO.lema}`;

// Íconos: `favicon.ico`, `icon.svg` y `apple-icon.png` en esta carpeta (convenciones de archivos de Next).
// Imagen para compartir: `public/opengraph.png`, declarada en `openGraph()` de `src/content/sitio.ts`.
export const metadata: Metadata = {
  metadataBase: urlDelSitio(),
  applicationName: SITIO.nombre,
  title: {
    default: TITULO,
    template: `%s · ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  openGraph: openGraph(TITULO, SITIO.descripcion, "/"),
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SkipLink />
        <SiteHeader />
        <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
