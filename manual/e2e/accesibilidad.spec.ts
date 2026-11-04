import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { RUTAS } from "./rutas";

for (const { nombre, ruta } of RUTAS) {
  test.describe(nombre, () => {
    test("no tiene problemas de accesibilidad según axe (incluido el contraste)", async ({ page }) => {
      await page.goto(ruta);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const resumen = violations.map((v) => ({
        id: v.id,
        ayuda: v.help,
        nodos: v.nodes.map((n) => `${n.target.join(" ")} → ${n.failureSummary ?? ""}`),
      }));
      expect(resumen).toEqual([]);
    });

    test("tiene idioma es-CO y un solo h1", async ({ page }) => {
      await page.goto(ruta);
      await expect(page.locator("html")).toHaveAttribute("lang", "es-CO");
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test("todos los botones y enlaces visibles miden al menos 48×48 px", async ({ page }) => {
      await page.goto(ruta);
      const pequenos = await page.locator("a:visible, button:visible").evaluateAll((els) =>
        els
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { texto: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim(), w: r.width, h: r.height };
          })
          // El enlace "Saltar al contenido" está oculto (1×1 px) hasta recibir foco; se prueba aparte.
          .filter((o) => o.texto !== "Saltar al contenido")
          .filter((o) => o.w < 48 || o.h < 48),
      );
      expect(pequenos).toEqual([]);
    });
  });
}
