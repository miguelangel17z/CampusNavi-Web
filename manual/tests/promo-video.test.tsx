import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { DURACION_VIDEO, PromoVideo, duracionEnPalabras, type EntradaTranscripcion } from "@/components/PromoVideo";
import { axeViolations } from "./axe";
import { buscarPalabrasProhibidas } from "./palabras";

const PUBLIC = join(process.cwd(), "public");
// Se lee el JSON del disco (no el import del componente) para comparar contra la fuente real.
const entradas = JSON.parse(
  readFileSync(join(PUBLIC, "video", "campus-navi-transcripcion.json"), "utf-8"),
) as EntradaTranscripcion[];

const NOMBRES = /\b(Alejandro|Miguel|Emmanuel|Jer[oó]nimo|Mateo)\b/i;

const video = (container: HTMLElement) => container.querySelector("video")!;

describe("PromoVideo", () => {
  it("tiene controles y no arranca solo, sin silenciar ni repetir", () => {
    const { container } = render(<PromoVideo />);
    const v = video(container);
    expect(v).toHaveAttribute("controls");
    expect(v).not.toHaveAttribute("autoplay");
    expect(v).not.toHaveAttribute("muted");
    expect(v).not.toHaveAttribute("loop");
    expect(v.autoplay).toBe(false);
    expect(v.muted).toBe(false);
    expect(v.loop).toBe(false);
    expect(v).toHaveAttribute("preload", "metadata");
    expect(v).toHaveAttribute("playsinline");
  });

  it("tiene póster, MP4 y subtítulos en español activos por defecto", () => {
    const { container } = render(<PromoVideo />);
    const v = video(container);
    expect(v).toHaveAttribute("poster", "/video/campus-navi-poster.jpg");
    expect(v).toHaveAttribute("width", "1920");
    expect(v).toHaveAttribute("height", "1080");
    const source = v.querySelector("source")!;
    expect(source).toHaveAttribute("src", "/video/campus-navi.mp4");
    expect(source).toHaveAttribute("type", "video/mp4");
    const track = v.querySelector("track")!;
    expect(track).toHaveAttribute("kind", "captions");
    expect(track).toHaveAttribute("src", "/video/campus-navi.vtt");
    expect(track).toHaveAttribute("srclang", "es");
    expect(track).toHaveAttribute("label", "Español");
    expect(track).toHaveAttribute("default");
  });

  it("los archivos que usa existen en public/", () => {
    for (const f of ["campus-navi.mp4", "campus-navi-poster.jpg", "campus-navi.vtt"]) {
      expect(() => readFileSync(join(PUBLIC, "video", f)), f).not.toThrow();
    }
  });

  it("ofrece descargar el MP4 si el navegador no reproduce video", () => {
    const { container } = render(<PromoVideo />);
    const enlace = within(video(container)).getByRole("link", { name: /Descargar el video/ });
    expect(enlace).toHaveAttribute("href", "/video/campus-navi.mp4");
  });

  it("anuncia de qué trata y cuánto dura, con la duración real del MP4", () => {
    expect(DURACION_VIDEO).toBeGreaterThanOrEqual(60);
    expect(DURACION_VIDEO).toBeLessThanOrEqual(90);
    const { container } = render(<PromoVideo />);
    const v = video(container);
    const palabras = duracionEnPalabras(DURACION_VIDEO);
    expect(v).toHaveAccessibleName(`Video de presentación de Campus Navi, ${palabras}`);
    expect(v).toHaveAccessibleDescription(new RegExp(`${palabras}.*subtítulos en español`));
  });

  it("muestra la transcripción completa dentro de «Leer la transcripción del video»", () => {
    const { container } = render(<PromoVideo />);
    const details = container.querySelector("details")!;
    const summary = details.querySelector("summary")!;
    expect(summary).toHaveTextContent("Leer la transcripción del video");
    expect(summary.className).toMatch(/\bmin-h-12\b/);

    const items = within(details).getAllByRole("listitem");
    expect(entradas.length).toBeGreaterThan(0);
    expect(items).toHaveLength(entradas.length);
    const prefijo = { imagen: "Imagen:", voz: "Voz:", sonido: "Sonido:" } as const;
    entradas.forEach((e, i) => {
      const reloj = `${Math.floor(e.segundo / 60)}:${String(Math.floor(e.segundo % 60)).padStart(2, "0")}`;
      const texto = e.tipo === "voz" ? `«${e.texto}»` : e.texto;
      expect(items[i].querySelector("time")).toHaveTextContent(reloj);
      expect(items[i]).toHaveTextContent(`${prefijo[e.tipo]} ${texto}`);
    });
  });

  it("ni la transcripción ni la sección mencionan funciones que no existen ni nombres de personas", () => {
    render(<Home />);
    const seccion = screen.getByRole("region", { name: "Conoce Campus Navi" });
    const v = seccion.querySelector("video")!;
    const texto = [
      seccion.textContent,
      v.getAttribute("aria-label"),
      v.querySelector("track")!.getAttribute("label"),
      ...entradas.map((e) => e.texto),
      // Los subtítulos también se ven en pantalla.
      readFileSync(join(PUBLIC, "video", "campus-navi.vtt"), "utf-8"),
    ].join(" ");
    expect(buscarPalabrasProhibidas(texto)).toEqual([]);
    expect(texto).not.toMatch(NOMBRES);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<PromoVideo />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
