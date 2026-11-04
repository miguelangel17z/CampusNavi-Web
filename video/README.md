# Campus Navi · Video promocional

Video de presentación de Campus Navi (≈ 82 s, 1920×1080, 30 fps) hecho con
[Remotion](https://www.remotion.dev/) 4.0.540: el video se escribe como componentes de React y se exporta a MP4.
El MP4, el póster, los subtítulos y la transcripción se copian a la Home del sitio (`../manual/public/video/`).

Remotion es gratis para personas, equipos de hasta 3 empleados y organizaciones sin ánimo de lucro
([licencia](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)).

## Requisitos

- Node.js 20 o superior y npm. `npm install` en esta carpeta.
- El material original en `public/material/` (no está en git, ver abajo).
- Solo para regenerar la narración: Python 3.10+ con `edge-tts==7.3.1` e internet.

## Material (fuera de git)

Los clips y la música pesan unos 75 MB y muestran a personas reales, así que no se versionan
(`public/material/` está en `.gitignore`). Se comparten por fuera (Drive, USB) y se ponen con estos nombres:

| Archivo | Contenido |
|---|---|
| `usuario1.mp4` | Usuaria da la vuelta de 360° y escucha el resultado |
| `usuario2.mp4` | 0:00–0:50 el equipo explica la app; desde 0:50 el usuario la prueba |
| `usuario3.mp4` | Usuaria probando; de 0:19 a 0:29 se oye cómo responde la app |
| `talkback.mp4` | Pantalla con TalkBack; de 0:49 a 1:02 se oye TalkBack |
| `musica.mp3` | «Our Odyssey», se usa desde el minuto 1:00 |

Duraciones y tamaños medidos: `src/material.ts`. Si cambias un archivo, vuelve a medirlo:
`npx remotion ffprobe public/material/<archivo>`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run studio` | Abre Remotion Studio para ver y ajustar el video en el navegador |
| `npm test` | Pruebas: línea de tiempo, mezcla de audio, narración y subtítulos |
| `npm run typecheck` | Tipos |
| `npm run exportar` | Render del MP4 (CRF 28), póster, subtítulos `.vtt`, transcripción `.json` y copia a `../manual/public/video/`. Falla si el MP4 pasa de 20 MB. ≈ 15 min en un portátil |
| `npm run exportar -- --sin-render` | Igual, pero reusa `out/campus-navi.mp4` (para cambiar solo subtítulos o póster) |
| `npm run exportar -- --sin-copiar` | No copia al sitio |
| `npm run subtitulos` | Solo regenera póster, `.vtt` y transcripción en `out/` (sin render ni copia) |

Después de exportar, en `../manual/` corre `npm test` y `npm run test:e2e`.

## Cómo está armado

| Archivo | Qué contiene |
|---|---|
| `src/timeline.ts` | **Fuente única de tiempos**: escenas, qué tramo de cada clip va en cada escena, tramos con audio original, inicio de cada narración y rótulos |
| `src/mezcla.ts` | Volumen de la música y de los clips en cada frame |
| `src/narracion.json` | Texto de la narración (voz `es-CO-SalomeNeural`, `-5%`) |
| `src/subtitulos.ts` | Genera el WebVTT y la transcripción (con descripción de cada escena) |
| `src/componentes/` | `Logo`, `TituloLetras`, `Rotulo`, `Fondo`, `Clip` |
| `src/escenas/` | `Intro` y `Cierre` |
| `src/CampusNaviPromo.tsx` | Composición principal: monta todo según `timeline.ts` |

Storyboard: intro con el logo (5 s) → el equipo explica la app (14 s) → TalkBack (19 s, con el audio original de
0:49 a 1:02) → pruebas con usuarios, que terminan con la usuaria escuchando el resultado (24 s) → Usuario 3 con el audio original de la app (12 s) → cierre (8 s).

Mezcla: la música sube de 0 a 40 % en 7 s, baja a 12 % en los tramos con audio original y se apaga en los
últimos 2,5 s. El audio de los clips queda al 3 % mientras habla la narración y al 100 % en los tramos originales.

### Cambiar un tramo de un clip

En `src/timeline.ts`, edita `desde` y `hasta` (segundos del clip original) en `TOMAS`. Las pruebas comprueban
que las tomas de cada escena sumen su duración, que quepan en el clip y que se respeten los tramos acordados.
Revisa el resultado en `npm run studio` o con un fotograma:
`npx remotion still src/index.ts CampusNaviPromo out/revision/x.png --frame=<n>`.

Para elegir tramos sirve la hoja de contacto: `python scripts/hoja_contacto.py public/material/usuario1.mp4
out/revision/u1.jpg --hasta 56 --cada 4` (necesita Pillow). El ffmpeg que trae Remotion es mínimo, por eso el
script extrae los fotogramas uno por uno.

### Cambiar la narración

1. Edita el texto en `src/narracion.json`.
2. Regenera: `PYTHONIOENCODING=utf-8 .venv/Scripts/python scripts/narracion.py` (o `--solo <id>`). En Windows
   puedes usar el entorno del sitio: `../manual/.venv/Scripts/python`.
3. `npm test`: falla si una frase quedó más larga que su ventana, si se solapa con un tramo de audio original o si
   menciona funciones que el usuario final aún no tiene. La frase con menos holgura es la del `cierre`.

Reglas del contenido: se habla del «equipo de desarrollo», sin nombres de personas, y no se mencionan funciones
que la app aún no ofrece al usuario final (la lista está en `tests/narracion.test.ts`).
