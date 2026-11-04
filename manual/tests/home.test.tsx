import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { axeViolations } from "./axe";
import { buscarPalabrasProhibidas } from "./palabras";

describe("Home", () => {
  it("muestra el nombre de la app como único título principal", () => {
    render(<Home />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent("Campus Navi");
  });

  it("tiene las secciones principales", () => {
    render(<Home />);
    for (const titulo of ["Cómo funciona", "Hecha para usarse sin ver", "Manuales"]) {
      expect(screen.getByRole("heading", { level: 2, name: titulo })).toBeInTheDocument();
    }
  });

  it("enlaza a los dos manuales", () => {
    render(<Home />);
    const hrefs = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/manual-usuario");
    expect(hrefs).toContain("/manual-administrador");
  });

  it("toda imagen tiene texto alternativo", () => {
    const { container } = render(<Home />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => expect(img.getAttribute("alt")?.trim().length).toBeGreaterThan(20));
  });

  it("no menciona funciones que el usuario final aún no tiene", () => {
    const { container } = render(<Home />);
    const alts = [...container.querySelectorAll("img")].map((i) => i.alt).join(" ");
    expect(buscarPalabrasProhibidas(`${container.textContent} ${alts}`)).toEqual([]);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<Home />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
