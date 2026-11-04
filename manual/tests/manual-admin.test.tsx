import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ManualAdministradorPage from "@/app/manual-administrador/page";
import { manualAdmin } from "@/content/admin";
import { capturas } from "@/content/capturas";
import { axeViolations } from "./axe";

describe("Manual del administrador", () => {
  it("tiene un único h1 y un h2 por sección, en orden", () => {
    render(<ManualAdministradorPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(
      manualAdmin.secciones.map((s) => s.titulo),
    );
  });

  it("cubre las funciones acordadas", () => {
    expect(manualAdmin.secciones.map((s) => s.id)).toEqual([
      "antes",
      "iniciar-sesion",
      "panel",
      "recolector",
      "lugares",
      "imagenes",
      "videos",
      "mapa",
    ]);
  });

  it("no documenta Estadísticas (fuera de alcance por ahora)", () => {
    const { container } = render(<ManualAdministradorPage />);
    const texto = container.textContent ?? "";
    expect(texto).not.toMatch(/estad[ií]stica/i);
  });

  it("el índice apunta a anclas que existen", () => {
    const { container } = render(<ManualAdministradorPage />);
    const nav = screen.getByRole("navigation", { name: "Contenido del manual" });
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(manualAdmin.secciones.length);
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("todos los enlaces internos (#...) de la página llevan a un elemento existente", () => {
    const { container } = render(<ManualAdministradorPage />);
    const internos = [...container.querySelectorAll('a[href^="#"]')];
    expect(internos.length).toBeGreaterThan(manualAdmin.secciones.length);
    for (const a of internos) {
      expect(container.querySelector(a.getAttribute("href")!), a.getAttribute("href")!).not.toBeNull();
    }
  });

  it("cada figura tiene pie y sus imágenes tienen texto alternativo", () => {
    const { container } = render(<ManualAdministradorPage />);
    const figuras = [...container.querySelectorAll("figure")];
    expect(figuras.length).toBeGreaterThanOrEqual(6);
    for (const f of figuras) {
      expect(f.querySelector("figcaption")?.textContent?.trim().length).toBeGreaterThan(10);
      const imgs = [...f.querySelectorAll("img")];
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => expect(img.alt.length).toBeGreaterThan(20));
    }
  });

  it("usa todas las capturas de administración y el grafo", () => {
    const { container } = render(<ManualAdministradorPage />);
    // En jsdom next/image no lee `images.unoptimized` y genera `/_next/image?url=...`; se decodifica.
    const srcs = [...container.querySelectorAll("img")].map((i) => decodeURIComponent(i.getAttribute("src") ?? ""));
    for (const id of [
      "adminLogin",
      "adminPanel",
      "adminLugares",
      "adminReasignar",
      "adminMapa",
      "grafoEafit",
      "adminRecolectorPartida",
      "adminRecolectorConfig",
      "adminCalibrarPaso",
      "adminLugaresLista",
      "adminEditorMapa",
      "adminAlertasLista",
      "adminVideosLista",
    ] as const) {
      expect(srcs.some((s) => s.includes(capturas[id].src)), capturas[id].src).toBe(true);
    }
  });

  it("ya no quedan bloques de captura pendiente", () => {
    const { container } = render(<ManualAdministradorPage />);
    expect(container.querySelectorAll("[data-captura-pendiente]")).toHaveLength(0);
  });

  it("las acciones irreversibles tienen aviso de atención", () => {
    render(<ManualAdministradorPage />);
    expect(screen.getByText(/Eliminar video borra todas sus fotos/)).toBeInTheDocument();
    expect(screen.getByText(/Revisa la selección antes de eliminar/)).toBeInTheDocument();
    expect(screen.getAllByText("Atención:")).toHaveLength(2);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<ManualAdministradorPage />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
