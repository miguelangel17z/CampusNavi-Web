import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Video de presentación de la Home: archivos servidos, metadatos reales, subtítulos y sin reproducción automática.

test("los archivos del video se sirven con el tipo correcto", async ({ request }) => {
  const archivos = [
    ["/video/campus-navi.mp4", "video/mp4"],
    ["/video/campus-navi.vtt", "text/vtt"],
    ["/video/campus-navi-poster.jpg", "image/jpeg"],
  ] as const;
  for (const [ruta, tipo] of archivos) {
    const res = await request.head(ruta);
    expect(res.status(), ruta).toBe(200);
    expect(res.headers()["content-type"], ruta).toContain(tipo);
  }
});

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("el video existe, con controles, póster y subtítulos en español", async ({ page }) => {
    const video = page.getByRole("region", { name: "Conoce Campus Navi" }).locator("video");
    await expect(video).toHaveCount(1);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("poster", "/video/campus-navi-poster.jpg");
    const track = video.locator('track[kind="captions"]');
    await expect(track).toHaveAttribute("srclang", "es");
    await expect(track).toHaveAttribute("src", "/video/campus-navi.vtt");
  });

  test("cargan los metadatos y dura entre 60 y 90 segundos, como anuncia su nombre", async ({ page }) => {
    const video = page.locator("video");
    await video.evaluate((v: HTMLVideoElement) => v.load());
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
    const duracion = await video.evaluate((v: HTMLVideoElement) => v.duration);
    expect(duracion).toBeGreaterThanOrEqual(60);
    expect(duracion).toBeLessThanOrEqual(90);
    // El nombre accesible dice la duración en palabras; debe coincidir con el archivo real.
    const m = Math.floor(Math.round(duracion) / 60);
    const s = Math.round(duracion) % 60;
    await expect(video).toHaveAttribute("aria-label", new RegExp(`${m} minutos? ${s} segundos?$`));
  });

  test("los subtítulos cargan y quedan activos", async ({ page }) => {
    const video = page.locator("video");
    await expect
      .poll(
        () =>
          video.evaluate((v: HTMLVideoElement) => {
            const t = v.textTracks[0];
            return t ? { modo: t.mode, idioma: t.language, cues: t.cues?.length ?? 0 } : null;
          }),
        { timeout: 15_000 },
      )
      .toEqual(expect.objectContaining({ modo: "showing", idioma: "es", cues: expect.any(Number) }));
    expect(await video.evaluate((v: HTMLVideoElement) => v.textTracks[0].cues!.length)).toBeGreaterThan(0);
  });

  test("el video está en pausa al abrir la página", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    const estado = await page.locator("video").evaluate((v: HTMLVideoElement) => ({
      paused: v.paused,
      currentTime: v.currentTime,
      autoplay: v.autoplay,
      muted: v.muted,
    }));
    expect(estado).toEqual({ paused: true, currentTime: 0, autoplay: false, muted: false });
  });

  test("el botón «Reproducir video» va antes del video, lo reproduce y lo pausa", async ({ page }) => {
    const seccion = page.getByRole("region", { name: "Conoce Campus Navi" });
    const boton = seccion.getByRole("button", { name: /^Reproducir video/ });
    const video = seccion.locator("video");
    // Orden de lectura: el lector de pantalla encuentra el botón antes que el reproductor.
    const antes = await boton.evaluate(
      (b, v) => !!(b.compareDocumentPosition(v!) & Node.DOCUMENT_POSITION_FOLLOWING),
      await video.elementHandle(),
    );
    expect(antes).toBe(true);
    const caja = await boton.boundingBox();
    expect(caja?.height).toBeGreaterThanOrEqual(48);

    await boton.click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    const pausar = seccion.getByRole("button", { name: "Pausar video" });
    await expect(pausar).toBeVisible();
    await pausar.click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(seccion.getByRole("button", { name: /^Seguir viendo el video/ })).toBeVisible();
  });

  test("la transcripción se abre desde un resumen de al menos 48 px", async ({ page }) => {
    const resumen = page.locator("summary", { hasText: "Leer la transcripción del video" });
    const caja = await resumen.boundingBox();
    expect(caja?.height).toBeGreaterThanOrEqual(48);
    expect(caja?.width).toBeGreaterThanOrEqual(48);
    const lista = page.locator("details ol");
    await expect(lista).toBeHidden();
    await resumen.click();
    await expect(lista).toBeVisible();
    expect(await lista.locator("li").count()).toBeGreaterThan(0);
  });

  test("no tiene problemas de accesibilidad según axe, con la transcripción abierta", async ({ page }) => {
    await page.locator("summary", { hasText: "Leer la transcripción del video" }).click();
    const { violations } = await new AxeBuilder({ page }).analyze();
    const resumen = violations.map((v) => ({
      id: v.id,
      ayuda: v.help,
      nodos: v.nodes.map((n) => `${n.target.join(" ")} → ${n.failureSummary ?? ""}`),
    }));
    expect(resumen).toEqual([]);
  });
});
