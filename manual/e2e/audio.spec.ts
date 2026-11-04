import { expect, test, type Page } from "@playwright/test";
import manifest from "../public/audio/manifest.json";
import { audioPaso, manualUsuario } from "../src/content/usuario";

type EstadoAudio = { src: string; paused: boolean; currentTime: number; duration: number };

declare global {
  interface Window {
    __audios: HTMLMediaElement[];
    __llamadasPlay: number;
  }
}

// Registra cada elemento de audio que llama a play(), para ver qué suena de verdad.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__audios = [];
    window.__llamadasPlay = 0;
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      window.__llamadasPlay++;
      if (!window.__audios.includes(this)) window.__audios.push(this);
      return original.call(this);
    };
  });
});

const estados = (page: Page) =>
  page.evaluate(() =>
    window.__audios.map<EstadoAudio>((a) => ({
      src: new URL(a.currentSrc || a.src).pathname,
      paused: a.paused,
      currentTime: a.currentTime,
      duration: a.duration,
    })),
  );

/** Espera a que un audio avance de verdad (no solo que el botón cambie de nombre). */
async function esperarQueSuene(page: Page, src: string) {
  await expect
    .poll(async () => (await estados(page)).filter((a) => !a.paused && a.currentTime > 0.3).map((a) => a.src), {
      timeout: 15_000,
    })
    .toEqual([src]);
}

test("el audio no arranca solo al abrir la página", async ({ page }) => {
  await page.goto("/manual-usuario/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);
  expect(await page.evaluate(() => window.__llamadasPlay)).toBe(0);
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(0);
});

test("cada paso y el manual completo tienen un MP3 que el servidor entrega", async ({ request }) => {
  const rutas = ["/audio/completo.mp3", ...manualUsuario.pasos.map(audioPaso)];
  for (const ruta of rutas) {
    const res = await request.get(ruta);
    expect(res.status(), ruta).toBe(200);
    expect(res.headers()["content-type"], ruta).toContain("audio/mpeg");
  }
});

test("el botón de un paso reproduce su MP3 y cambia entre Escuchar y Pausar", async ({ page }) => {
  await page.goto("/manual-usuario/");
  const paso = manualUsuario.pasos[0];
  const src = audioPaso(paso);

  await page.getByRole("button", { name: `Escuchar paso 1: ${paso.titulo}, 20 segundos` }).click();
  const pausar = page.getByRole("button", { name: /^Pausar paso 1:/ });
  await expect(pausar).toBeVisible();
  await esperarQueSuene(page, src);

  // La duración real del MP3 coincide con la que anuncia el botón (manifest.json).
  const [audio] = await estados(page);
  expect(Math.round(audio.duration)).toBe(manifest.duraciones[paso.id as keyof typeof manifest.duraciones]);

  await pausar.click();
  await expect(page.getByRole("button", { name: /^Escuchar paso 1:/ })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/En pausa: paso 1\./);
  expect((await estados(page)).every((a) => a.paused)).toBe(true);
});

test("solo suena un audio a la vez", async ({ page }) => {
  await page.goto("/manual-usuario/");

  await page.getByRole("button", { name: /^Escuchar paso 1:/ }).click();
  await esperarQueSuene(page, audioPaso(manualUsuario.pasos[0]));

  await page.getByRole("button", { name: /^Escuchar paso 2:/ }).click();
  await esperarQueSuene(page, audioPaso(manualUsuario.pasos[1]));
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Escuchar paso 1:/ })).toBeVisible();

  await page.getByRole("button", { name: /^Escuchar el manual completo/ }).click();
  await esperarQueSuene(page, "/audio/completo.mp3");
  await expect(page.getByRole("button", { name: /^Pausar/ })).toHaveCount(1);
});

test("todos los botones de audio de los pasos reproducen su archivo", async ({ page }) => {
  await page.goto("/manual-usuario/");
  for (const [i, paso] of manualUsuario.pasos.entries()) {
    await page.getByRole("button", { name: new RegExp(`^Escuchar paso ${i + 1}:`) }).click();
    await esperarQueSuene(page, audioPaso(paso));
  }
});
