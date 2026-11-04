import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ManualUsuarioPage from "@/app/manual-usuario/page";
import { manualUsuario } from "@/content/usuario";
import { capturas } from "@/content/capturas";
import { axeViolations } from "./axe";
import { buscarPalabrasProhibidas } from "./palabras";

describe("Manual del usuario", () => {
  it("tiene un único h1", () => {
    render(<ManualUsuarioPage />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(manualUsuario.titulo);
  });

  it("tiene un h2 por paso, numerados y en orden", () => {
    render(<ManualUsuarioPage />);
    const h2 = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.trim());
    const esperados = manualUsuario.pasos.map((p, i) => `Paso ${i + 1}. ${p.titulo}`);
    expect(h2).toEqual(["Cómo usar este manual", ...esperados]);
  });

  it("no usa encabezados de nivel 3 o más (navegación por encabezados simple)", () => {
    const { container } = render(<ManualUsuarioPage />);
    expect(container.querySelectorAll("h3, h4, h5, h6")).toHaveLength(0);
  });

  it("cada paso es una región con nombre", () => {
    render(<ManualUsuarioPage />);
    for (const [i, paso] of manualUsuario.pasos.entries()) {
      expect(screen.getByRole("region", { name: `Paso ${i + 1}. ${paso.titulo}` })).toBeInTheDocument();
    }
  });

  it("las capturas usadas existen y tienen texto alternativo", () => {
    const { container } = render(<ManualUsuarioPage />);
    const usadas = manualUsuario.pasos.flatMap((p) => p.capturas ?? []);
    for (const id of usadas) expect(capturas[id]).toBeDefined();
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs).toHaveLength(usadas.length);
    imgs.forEach((img) => expect(img.alt.length).toBeGreaterThan(20));
  });

  it("solo habla de ubicarse: no menciona funciones que el usuario aún no tiene", () => {
    const { container } = render(<ManualUsuarioPage />);
    const alts = [...container.querySelectorAll("img")].map((i) => i.alt).join(" ");
    expect(buscarPalabrasProhibidas(`${container.textContent} ${alts}`)).toEqual([]);
    expect(buscarPalabrasProhibidas(JSON.stringify(manualUsuario))).toEqual([]);
  });

  it("el detector de palabras prohibidas sí detecta (control)", () => {
    expect(buscarPalabrasProhibidas("Ir a un lugar desde aquí, navegación guiada por la ruta")).toEqual([
      "Ir a un lugar",
      "navegación",
      "guiada",
      "ruta",
    ]);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<ManualUsuarioPage />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
