import { expect, test, type Locator } from "@playwright/test";
import { RUTAS } from "./rutas";

/** El contorno de foco debe verse: estilo distinto de `none` y al menos 2 px de grosor. */
async function expectFocoVisible(el: Locator) {
  const { estilo, grosor } = await el.evaluate((n) => {
    const cs = getComputedStyle(n);
    return { estilo: cs.outlineStyle, grosor: parseFloat(cs.outlineWidth) };
  });
  expect(estilo).not.toBe("none");
  expect(grosor).toBeGreaterThanOrEqual(2);
}

for (const { nombre, ruta } of RUTAS) {
  test(`${nombre}: "Saltar al contenido" es lo primero, se ve con el foco y lleva al contenido`, async ({ page }) => {
    await page.goto(ruta);
    await page.keyboard.press("Tab");

    const salto = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(salto).toBeFocused();
    const caja = await salto.boundingBox();
    expect(caja?.width).toBeGreaterThanOrEqual(48);
    expect(caja?.height).toBeGreaterThanOrEqual(48);
    await expectFocoVisible(salto);

    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenido")).toBeFocused();
    await expect(page).toHaveURL(/#contenido$/);
  });
}

test("el menú principal se recorre con Tab y abre las páginas con Enter", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "Principal" });

  // Tab: salto, logo y luego los tres enlaces del menú, en orden.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Campus Navi, inicio" })).toBeFocused();
  for (const nombreEnlace of ["Inicio", "Manual de usuario", "Manual de administrador"]) {
    await page.keyboard.press("Tab");
    const enlace = menu.getByRole("link", { name: nombreEnlace, exact: true });
    await expect(enlace).toBeFocused();
    await expectFocoVisible(enlace);
  }

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/manual-administrador\/$/);
  await expect(menu.getByRole("link", { name: "Manual de administrador" })).toHaveAttribute("aria-current", "page");

  await menu.getByRole("link", { name: "Manual de usuario", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/manual-usuario\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test.describe("índice del manual del administrador", () => {
  // Sin desplazamiento suave: el salto es inmediato y la prueba no depende de la animación.
  test.use({ reducedMotion: "reduce" });

  test("lleva a cada sección con el teclado", async ({ page }) => {
    await page.goto("/manual-administrador/");
    const indice = page.getByRole("navigation", { name: "Contenido del manual" });
    const enlaces = indice.getByRole("link");
    const total = await enlaces.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i++) {
      const enlace = enlaces.nth(i);
      const destino = (await enlace.getAttribute("href"))!;
      await enlace.focus();
      await expectFocoVisible(enlace);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${destino}$`));
      await expect(page.locator(destino)).toBeInViewport();
    }
  });
});

test("los botones de audio se activan con Enter y con Espacio", async ({ page }) => {
  await page.goto("/manual-usuario/");
  const boton = page.getByRole("button", { name: /^Escuchar paso 1:/ });
  await boton.focus();
  await expectFocoVisible(boton);

  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /^Pausar paso 1:/ })).toBeFocused();

  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: /^Escuchar paso 1:/ })).toBeFocused();
});
