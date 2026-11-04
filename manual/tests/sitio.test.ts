import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { IMAGEN_OG, SITIO, openGraph, urlDelSitio } from "@/content/sitio";
import { buscarPalabrasProhibidas } from "./palabras";

describe("URL pública para Open Graph", () => {
  it("usa SITE_URL si está definida", () => {
    expect(urlDelSitio({ SITE_URL: "https://campus.example", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }).href).toBe(
      "https://campus.example/",
    );
  });

  it("usa el dominio de producción que pone Vercel", () => {
    expect(urlDelSitio({ VERCEL_PROJECT_PRODUCTION_URL: "campus-navi.vercel.app" }).href).toBe(
      "https://campus-navi.vercel.app/",
    );
  });

  it("en local cae en localhost:3000", () => {
    expect(urlDelSitio({}).href).toBe("http://localhost:3000/");
  });
});

describe("metadatos", () => {
  it("cada página declara el nombre del sitio y el idioma", () => {
    expect(openGraph("T", "D", "/manual-usuario/")).toMatchObject({
      siteName: "Campus Navi",
      locale: "es_CO",
      title: "T",
      description: "D",
      url: "/manual-usuario/",
      images: [{ url: "/opengraph.png", width: 1200, height: 630 }],
    });
  });

  it("la imagen para compartir existe en public/", () => {
    expect(existsSync(join(process.cwd(), "public", IMAGEN_OG.url))).toBe(true);
  });

  it("la descripción del sitio no nombra funciones que no están en el manual", () => {
    expect(buscarPalabrasProhibidas(SITIO.descripcion)).toEqual([]);
  });
});

describe("documentación", () => {
  it.each(["README.md", "DEMO.md"])("%s no nombra funciones fuera del manual ni Estadísticas", (archivo) => {
    const texto = readFileSync(join(process.cwd(), archivo), "utf8");
    expect(buscarPalabrasProhibidas(texto)).toEqual([]);
    expect(texto).not.toMatch(/estad[ií]sticas/i);
  });
});
