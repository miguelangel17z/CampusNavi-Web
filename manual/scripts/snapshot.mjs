// Captura de pantalla de revisión visual: node scripts/snapshot.mjs <ruta> <archivo> [ancho]
// Requiere el sitio servido en http://localhost:4173 (npx serve out -l 4173).
import { chromium } from "@playwright/test";

// La ruta va sin "/" inicial (Git Bash en Windows convierte "/" en una ruta de disco). Usa "-" para la Home.
const [arg = "-", archivo = "snapshot.png", ancho = "1280"] = process.argv.slice(2);
const ruta = arg === "-" ? "/" : `/${arg.replace(/^\/+/, "")}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(ancho), height: 900 } });
await page.goto(`http://localhost:4173${ruta}`, { waitUntil: "networkidle" });
// Recorre la página para que carguen las imágenes con loading="lazy".
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState("networkidle");
await page.screenshot({ path: archivo, fullPage: true });
await browser.close();
console.log("ok", archivo);
