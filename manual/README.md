# Campus Navi · Sitio web y manuales

Sitio estático con los manuales de **Campus Navi** (Sprint 3, fase «3. Manual»). Tiene tres páginas:

| Página | Dirección | Para quién |
|---|---|---|
| Inicio | `/` | Presentación de la app y enlaces a los manuales |
| Manual para personas con discapacidad visual | `/manual-usuario/` | Persona ciega que usa TalkBack, con un audio por paso y otro del manual completo |
| Manual del administrador y recolector | `/manual-administrador/` | Quien administra el panel: inicio de sesión, recolector de imágenes, lugares, mapa y alertas |

Está hecho con Next.js 16 (App Router), React 19 y Tailwind CSS 4. No tiene backend: `npm run build` genera HTML,
CSS, JS, capturas y audios en `out/`, y esa carpeta se puede servir en cualquier servidor estático o abrir sin
internet.

Por ahora vive en `Proyecto_4U_principal/manual/`. Más adelante se moverá a un repositorio propio; todo lo
necesario está dentro de esta carpeta (no depende de archivos de fuera).

El guion para la sustentación está en [`DEMO.md`](./DEMO.md).

## Requisitos

- Node.js 20.9 o superior (probado con Node 22) y npm.
- Solo para regenerar los audios: Python 3.10 o superior e internet.
- Solo para las pruebas de punta a punta: el navegador de Playwright (`npx playwright install chromium`).

## Correr el sitio

```bash
npm install          # instala dependencias
npm run dev          # servidor de desarrollo en http://localhost:3000
```

Los cambios en `src/` se ven al instante en el navegador.

### Ver el build final

```bash
npm run build        # genera out/
npx serve out        # sirve out/ en http://localhost:3000 (o npm run preview)
```

`out/` es exactamente lo que se publica en Vercel. Úsalo para revisar antes de desplegar y para la
sustentación sin internet.

## Pruebas

| Comando | Qué revisa |
|---|---|
| `npm test` | Pruebas unitarias con Vitest y Testing Library (jsdom): estructura de encabezados, nombres accesibles, axe-core, palabras que no deben aparecer en el manual del usuario, audios al día con el texto |
| `npx eslint src tests e2e playwright.config.ts` | Lint |
| `npx tsc --noEmit` | Tipos |
| `npm run test:e2e` | Hace `next build` y corre Playwright contra `out/` en escritorio y en un celular (Pixel 7): axe con contraste, teclado y reproducción de audio |
| `npm run e2e` | Lo mismo, pero usa el `out/` que ya existe (más rápido si no cambiaste nada) |

Playwright levanta `npx serve out -l 4173` solo; si ya hay algo sirviendo en el puerto 4173, lo reutiliza.

## Dónde está el contenido

El texto no está repartido por los componentes: cada manual tiene un archivo de contenido.

| Archivo | Qué contiene |
|---|---|
| `src/content/usuario.json` | Manual del usuario: título, introducción, instrucciones de uso con TalkBack, los siete pasos (`antes`, `abrir`, `pedir`, `vuelta`, `esperar`, `resultado`, `problemas`) y el cierre. Es la **única fuente** de la página y de los audios |
| `src/content/usuario.ts` | Tipos del JSON, la narración de cada paso (`narracionPaso`, `narracionCompleta`) y las direcciones de los MP3 |
| `src/content/admin.ts` | Manual del administrador como secciones hechas de bloques: `parrafo`, `subtitulo`, `pasos`, `lista`, `figura`, `aviso` (`info` o `peligro`) y `pendiente` |
| `src/content/capturas.ts` | Registro de capturas: archivo en `public/capturas/`, tamaño y texto alternativo. Los componentes piden una captura por su id (`PhoneScreenshot id="resultado"`) |
| `src/content/sitio.ts` | Nombre, lema y descripción del sitio, y la URL pública para Open Graph |

Las capturas originales están en `Proyecto_4U_principal/media_manual/`. Las copias de `public/capturas/` tienen
nombres sin espacios (el mapeo está en `.kiro/specs/campus-navi-manual/design.md`).

Reglas para el manual del usuario:

- Solo cubre «¿dónde estoy?»: el escaneo de 360° y el resultado. Las demás funciones de la app no se nombran,
  ni siquiera como algo futuro. `tests/palabras.ts` tiene la lista de palabras prohibidas y las pruebas fallan si
  aparece alguna en la Home o en el manual del usuario.
- Cada paso es un `h2` («Paso N. Título») y no hay más niveles de encabezado: así TalkBack salta de paso en paso.
- Si cambias cualquier texto de un paso, regenera los audios (siguiente sección). `tests/audios.test.ts` falla
  mientras los MP3 no coincidan con el texto.

### Agregar la captura pendiente del Recolector de imágenes

La sección `recolector` de `src/content/admin.ts` tiene un bloque `{ tipo: "pendiente", ... }` que se ve como un
recuadro punteado con «Captura pendiente». Cuando lleguen las capturas (ubicación manual inicial y recolección
en curso):

1. Copia las imágenes a `public/capturas/` con nombres sin espacios, por ejemplo `recolector-inicio.jpeg` y
   `recolector-en-curso.jpeg`.
2. Regístralas en `src/content/capturas.ts` con su `src`, `width`, `height` (las de celular usan `...telefono`,
   624 × 1600) y un `alt` que describa lo que se ve en pantalla.
3. En `src/content/admin.ts`, reemplaza el bloque `pendiente` por:

   ```ts
   {
     tipo: "figura",
     capturas: ["recolectorInicio", "recolectorEnCurso"],
     pie: "Ubicación manual inicial y recolección en curso.",
   },
   ```

4. Corre `npm test` y `npm run test:e2e`.

## Regenerar los audios

Los audios del manual del usuario se generan con [edge-tts](https://github.com/rany2/edge-tts) (voz neuronal
`es-CO-SalomeNeural`, velocidad `-5%`) a partir de `src/content/usuario.json`. El script escribe:

- `public/audio/<id>.mp3`: un audio por paso.
- `public/audio/completo.mp3`: el manual completo.
- `public/audio/manifest.json`: voz, velocidad, hash del texto de cada audio y su duración en segundos. La
  página usa la duración en el nombre de cada botón («Escuchar paso 4: …, 40 segundos»).

Crear el entorno de Python (una sola vez; `.venv/` está en `.gitignore`):

```bash
python -m venv .venv
.venv/Scripts/pip install edge-tts==7.3.1     # Windows
# .venv/bin/pip install edge-tts==7.3.1       # macOS o Linux
```

Generar (necesita internet, porque edge-tts usa el servicio de voz de Microsoft Edge):

```bash
# Windows, Git Bash. PYTHONIOENCODING evita errores al imprimir tildes en la consola.
PYTHONIOENCODING=utf-8 .venv/Scripts/python scripts/generate_audio.py

# macOS o Linux
.venv/bin/python scripts/generate_audio.py
```

Opciones:

| Opción | Uso |
|---|---|
| `--dry-run` | Muestra qué audios se generarían, su largo y el comienzo del texto, sin generar nada ni usar internet |
| `--voz es-CO-GonzaloNeural` | Cambia la voz (por defecto `es-CO-SalomeNeural`). `.venv/Scripts/edge-tts --list-voices` lista las disponibles |
| `--velocidad -10%` | Cambia la velocidad (por defecto `-5%`) |

Después de generar, corre `npm test` para confirmar que los audios coinciden con el texto. Los MP3 se
versionan junto con el código.

## Ícono e imagen para compartir

| Archivo | Qué es |
|---|---|
| `src/app/icon.svg` | Ícono de la pestaña: orbe violeta sobre fondo azul noche. Es la fuente de los demás íconos |
| `src/app/favicon.ico` | Ícono clásico (16, 32 y 48 px) |
| `src/app/apple-icon.png` | Ícono de 180 × 180 px para iPhone y iPad |
| `public/opengraph.png` | Imagen de 1200 × 630 px que se ve al compartir el enlace (WhatsApp, redes, Teams) |

Los tres primeros siguen las convenciones de archivos de metadatos de Next: basta con que estén en `src/app/`. La
imagen para compartir se declara en `openGraph()` de `src/content/sitio.ts`, que usan el layout y cada página
junto con su título y descripción.

`favicon.ico`, `apple-icon.png` y `opengraph.png` se generan con Chromium de Playwright:

```bash
node scripts/generate_iconos.mjs
```

Son archivos estáticos con extensión a propósito: las imágenes generadas con `ImageResponse`
(`apple-icon.tsx`, `opengraph-image.tsx`) salen sin extensión en `output: "export"` y los servidores estáticos
las entregan sin tipo de imagen.

Las etiquetas Open Graph necesitan una URL absoluta. `src/content/sitio.ts` la toma, en este orden, de la variable
`SITE_URL` (si se configura un dominio propio), de `VERCEL_PROJECT_PRODUCTION_URL` (Vercel la define sola en el
build) o, en local, de `http://localhost:3000`.

## Desplegar en Vercel

El sitio es una exportación estática (`output: "export"` en `next.config.ts`), así que Vercel solo publica
`out/`. Los MP3 ya están en el repositorio, por lo que Vercel no necesita Python ni edge-tts.

1. Sube esta carpeta a un repositorio de GitHub (cuando se mueva a su propio repositorio, la carpeta será la raíz).
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. Si el repositorio es `Proyecto_4U_principal`, en **Root Directory** elige `manual`. Si es el repositorio
   propio, deja la raíz.
4. Vercel detecta Next.js y usa `npm run build`. No hace falta cambiar nada más ni definir variables de entorno.
5. Opcional: si se usa un dominio propio, agrega la variable `SITE_URL` (por ejemplo `https://campusnavi.co`)
   para que las vistas previas al compartir apunten a ese dominio.

Cada push a la rama principal publica una nueva versión; las demás ramas generan vistas previas.

Para desplegar desde la terminal sin conectar GitHub: `npx vercel` (vista previa) o `npx vercel --prod`.

## Estructura

```
manual/
├── src/
│   ├── app/              Páginas (/, /manual-usuario, /manual-administrador), layout, íconos y Open Graph
│   ├── components/       Encabezado, enlace de salto, capturas, pasos, botones de audio, bloques del manual admin
│   └── content/          Contenido de los manuales y registro de capturas
├── public/
│   ├── capturas/         Capturas de la app
│   └── audio/            MP3 y manifest.json
├── scripts/
│   ├── generate_audio.py Genera los audios con edge-tts
│   ├── generate_iconos.mjs Genera favicon.ico, apple-icon.png y opengraph.png
│   └── snapshot.mjs      Captura de pantalla de una página servida en el puerto 4173 (revisión visual)
├── tests/                Vitest
├── e2e/                  Playwright
├── DEMO.md               Guion de la sustentación
└── next.config.ts        Exportación estática a out/
```
