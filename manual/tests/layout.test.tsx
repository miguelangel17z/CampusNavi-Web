import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { SiteFooter } from "@/components/SiteFooter";
import { axeViolations } from "./axe";

const pathname = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

function renderShell() {
  return render(
    <>
      <SkipLink />
      <SiteHeader />
      <main id="contenido">contenido</main>
      <SiteFooter />
    </>,
  );
}

describe("estructura común", () => {
  beforeEach(() => {
    pathname.value = "/";
  });

  it("el enlace de salto apunta al contenido principal", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Saltar al contenido" })).toHaveAttribute("href", "#contenido");
  });

  it("la navegación principal tiene los tres enlaces", () => {
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Principal" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Inicio",
      "Manual de usuario",
      "Manual de administrador",
    ]);
  });

  it.each([
    ["/", "Inicio"],
    ["/manual-usuario", "Manual de usuario"],
    ["/manual-usuario/", "Manual de usuario"],
    ["/manual-administrador/", "Manual de administrador"],
  ])("en %s marca '%s' como página actual", (path, label) => {
    pathname.value = path;
    renderShell();
    const nav = screen.getByRole("navigation", { name: "Principal" });
    const current = within(nav)
      .getAllByRole("link")
      .filter((l) => l.getAttribute("aria-current") === "page");
    expect(current.map((l) => l.textContent)).toEqual([label]);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = renderShell();
    expect(await axeViolations(container)).toEqual([]);
  });
});
