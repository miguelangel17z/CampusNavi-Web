// Genera el favicon, el ícono de Apple y la imagen para compartir (Open Graph) con Chromium de Playwright.
//   node scripts/generate_iconos.mjs
// Salidas:
//   src/app/favicon.ico      16, 32 y 48 px, a partir de src/app/icon.svg
//   src/app/apple-icon.png   180 × 180
//   public/opengraph.png     1200 × 630 (la usa `openGraph()` de src/content/sitio.ts)
// Son archivos estáticos con extensión para que cualquier servidor (Vercel, `serve`) los entregue con su tipo
// de imagen. Las rutas generadas con `ImageResponse` salen sin extensión en `output: "export"`.
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

const NOCHE = "#050816";
const ORBE = `
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 50%, #2a1678 0%, #5b3df5 48%, #7c4dff 78%);
  border: 4px solid #c4b5fd;
  box-shadow: 0 0 60px rgb(124 77 255 / 0.55), 0 0 140px rgb(124 77 255 / 0.25);`;

const svg = await readFile("src/app/icon.svg", "utf8");
const browser = await chromium.launch();

async function capturar(html, ancho, alto, transparente = false) {
  const page = await browser.newPage({ viewport: { width: ancho, height: alto } });
  await page.setContent(`<!doctype html><html><body style="margin:0">${html}</body></html>`);
  const png = await page.screenshot({ omitBackground: transparente, clip: { x: 0, y: 0, width: ancho, height: alto } });
  await page.close();
  return png;
}

// favicon.ico: un ICO con PNG dentro (lo aceptan todos los navegadores actuales).
const tamanos = [16, 32, 48];
const pngs = [];
for (const t of tamanos) {
  pngs.push(await capturar(svg.replace("<svg ", `<svg width="${t}" height="${t}" `), t, t, true));
}
const cabecera = Buffer.alloc(6 + 16 * pngs.length);
cabecera.writeUInt16LE(1, 2);
cabecera.writeUInt16LE(pngs.length, 4);
let offset = cabecera.length;
pngs.forEach((png, i) => {
  const e = 6 + 16 * i;
  cabecera.writeUInt8(tamanos[i], e);
  cabecera.writeUInt8(tamanos[i], e + 1);
  cabecera.writeUInt16LE(1, e + 4);
  cabecera.writeUInt16LE(32, e + 6);
  cabecera.writeUInt32LE(png.length, e + 8);
  cabecera.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([cabecera, ...pngs]));

// apple-icon.png: orbe sobre fondo azul noche (iOS redondea las esquinas solo).
await writeFile(
  "src/app/apple-icon.png",
  await capturar(
    `<div style="width:180px;height:180px;background:${NOCHE};display:flex;align-items:center;justify-content:center">
       <div style="${ORBE.replace("4px", "6px").replace(/60px|140px/g, (m) => `${parseInt(m) / 3}px`)}width:112px;height:112px;
                   display:flex;align-items:center;justify-content:center">
         <div style="width:30px;height:30px;border-radius:9999px;background:#c4b5fd"></div>
       </div>
     </div>`,
    180,
    180,
  ),
);

// opengraph.png: orbe, nombre y lema, con los colores del sitio.
await writeFile(
  "public/opengraph.png",
  await capturar(
    `<div style="width:1200px;height:630px;box-sizing:border-box;padding:0 88px;display:flex;align-items:center;gap:64px;
                 color:white;font-family:'Segoe UI',Inter,Arial,sans-serif;white-space:nowrap;
                 background:radial-gradient(circle at 20% 50%, rgb(124 77 255 / 0.28) 0%, transparent 45%), ${NOCHE}">
       <div style="${ORBE}width:260px;height:260px;flex:none;border-width:8px"></div>
       <div>
         <div style="font-size:100px;font-weight:700;letter-spacing:-2px;line-height:1">Campus <span style="color:#b9a6ff">Navi</span></div>
         <div style="margin-top:28px;font-size:34px;color:#b9a6ff">Accesibilidad y orientación para todos</div>
         <div style="margin-top:44px;display:inline-block;padding:14px 26px;font-size:24px;border-radius:24px;
                     border:2px solid #7c4dff;background:#0c1030;color:#c7c9e8">Manual de usuario · Manual de administrador</div>
       </div>
     </div>`,
    1200,
    630,
  ),
);

await browser.close();
console.log("Listo: src/app/favicon.ico, src/app/apple-icon.png y public/opengraph.png");
