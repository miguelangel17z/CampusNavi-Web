import { expect, test } from "@playwright/test";
import { RUTAS } from "./rutas";

// Íconos y Open Graph del build estático: las etiquetas existen y los archivos se sirven desde out/.
for (const { nombre, ruta } of RUTAS) {
  test(`${nombre}: íconos y Open Graph`, async ({ page, request }) => {
    await page.goto(ruta);
    const head = page.locator("head");

    await expect(head.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Campus Navi");
    await expect(head.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CO");
    await expect(head.locator('meta[property="og:title"]')).toHaveAttribute("content", /Campus Navi/);
    await expect(head.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
    await expect(head.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Campus Navi/);
    await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

    const ogImagen = await head.locator('meta[property="og:image"]').getAttribute("content");
    const ogUrl = await head.locator('meta[property="og:url"]').getAttribute("content");
    expect(new URL(ogUrl!).pathname).toBe(ruta);

    // og:image es absoluta (dominio público); en local se pide la misma ruta al servidor de prueba.
    const iconos = [
      new URL(ogImagen!).pathname,
      ...(await head.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((links) =>
        links.map((l) => new URL((l as HTMLLinkElement).href).pathname),
      )),
    ];
    expect(iconos).toEqual(
      expect.arrayContaining(["/opengraph.png", "/favicon.ico", "/icon.svg", "/apple-icon.png"]),
    );
    for (const ruta of iconos) {
      const respuesta = await request.get(ruta);
      expect(respuesta.status(), ruta).toBe(200);
      expect(respuesta.headers()["content-type"], ruta).toMatch(/^image\//);
    }
  });
}
