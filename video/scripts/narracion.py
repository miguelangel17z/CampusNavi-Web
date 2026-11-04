"""Genera la narración del video promocional con edge-tts.

Lee `src/narracion.json` (voz, velocidad y frases) y escribe:
  - public/narracion/<id>.mp3       un audio por frase
  - public/narracion/manifest.json  { voz, velocidad, frases: { <id>: { sha256, duracionSeg } } }
    `sha256` es el hash del texto narrado; lo usa `tests/narracion.test.ts` para detectar
    audios desactualizados y comprobar que cada frase cabe en su ventana de la línea de tiempo.

edge-tts deja ~0,9 s de silencio al final de cada audio: se recorta con el ffmpeg que trae
Remotion (copia de flujo, sin recodificar), dejando 0,15 s de cola. La duración se mide con su
ffprobe (node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe, o `ffprobe` del PATH);
si no se encuentra, no se recorta y la duración se estima por el tamaño (MP3 a 48 kbit/s).

Entorno propio en video/ (video/.venv/ está en .gitignore):
  python -m venv .venv
  .venv/Scripts/pip install edge-tts==7.3.1   (Windows)   |   .venv/bin/pip install edge-tts==7.3.1
  PYTHONIOENCODING=utf-8 .venv/Scripts/python scripts/narracion.py

Uso (cwd = video/):
  python scripts/narracion.py              genera todas las frases
  python scripts/narracion.py --solo talkback
  python scripts/narracion.py --dry-run    muestra qué se generaría, sin red

Requiere internet (edge-tts usa el servicio de voz en línea de Microsoft Edge).
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "src" / "narracion.json"
SALIDA = RAIZ / "public" / "narracion"
MANIFEST = SALIDA / "manifest.json"
BINARIOS_REMOTION = RAIZ / "node_modules" / "@remotion" / "compositor-win32-x64-msvc"
FFPROBE_REMOTION = BINARIOS_REMOTION / "ffprobe.exe"
FFMPEG_REMOTION = BINARIOS_REMOTION / "ffmpeg.exe"
BITRATE_EDGE_TTS = 48_000  # edge-tts entrega MP3 mono de 24 kHz a 48 kbit/s
UMBRAL_SILENCIO = "-45dB"
COLA_SILENCIO = 0.15  # segundos de silencio que se conservan al final de cada frase


def sha256(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def escribir_atomico(destino: Path, contenido: str) -> None:
    tmp = destino.with_suffix(destino.suffix + ".tmp")
    tmp.write_text(contenido, encoding="utf-8")
    tmp.replace(destino)


def ruta_ffprobe() -> str | None:
    if FFPROBE_REMOTION.is_file():
        return str(FFPROBE_REMOTION)
    return shutil.which("ffprobe")


def ruta_ffmpeg() -> str | None:
    if FFMPEG_REMOTION.is_file():
        return str(FFMPEG_REMOTION)
    return shutil.which("ffmpeg")


def fin_de_voz(mp3: Path, ffmpeg: str, duracion: float) -> float | None:
    """Segundo en que empieza el silencio final (None si el audio no termina en silencio)."""
    r = subprocess.run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", str(mp3),
         "-af", f"silencedetect=noise={UMBRAL_SILENCIO}:d=0.15", "-f", "null", "-"],
        capture_output=True, text=True, timeout=60,
    )
    inicios = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    finales = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    if not inicios:
        return None
    # El último silencio llega hasta el final del archivo (ffmpeg lo cierra en EOF o lo deja abierto).
    if len(finales) < len(inicios) or finales[-1] >= duracion - 0.05:
        return inicios[-1] if inicios[-1] > 0 else None
    return None


def recortar_silencio_final(mp3: Path) -> None:
    """edge-tts deja ~0,9 s de silencio al final; se corta (copia de flujo, sin recodificar)
    dejando COLA_SILENCIO para que la frase no termine en seco. Sin ffmpeg, no hace nada."""
    ffmpeg = ruta_ffmpeg()
    if not ffmpeg or not ruta_ffprobe():
        print("  aviso: sin ffmpeg/ffprobe no se recorta el silencio final", file=sys.stderr)
        return
    fin = fin_de_voz(mp3, ffmpeg, duracion_segundos(mp3))
    if fin is None:
        return
    tmp = mp3.with_suffix(".recorte.tmp")
    subprocess.run(
        [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3),
         "-t", f"{fin + COLA_SILENCIO:.3f}", "-c", "copy", "-f", "mp3", str(tmp)],
        check=True, timeout=60,
    )
    tmp.replace(mp3)


def duracion_segundos(mp3: Path) -> float:
    """Duración del MP3 en segundos (2 decimales). ffprobe si está; si no, por bitrate."""
    ffprobe = ruta_ffprobe()
    if ffprobe:
        try:
            r = subprocess.run(
                [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(mp3)],
                capture_output=True, text=True, check=True, timeout=30,
            )
            return round(float(r.stdout.strip()), 2)
        except (subprocess.SubprocessError, ValueError, OSError) as e:
            print(f"  aviso: ffprobe falló ({e}); uso el cálculo por bitrate", file=sys.stderr)
    return round(mp3.stat().st_size * 8 / BITRATE_EDGE_TTS, 2)


async def generar(texto: str, destino: Path, voz: str, velocidad: str) -> None:
    import edge_tts  # importación tardía: --dry-run no necesita la librería

    tmp = destino.with_suffix(".mp3.tmp")
    await edge_tts.Communicate(texto, voz, rate=velocidad).save(str(tmp))
    tmp.replace(destino)


def leer_manifest(voz: str, velocidad: str) -> dict:
    """Manifiesto existente (para --solo); se descarta si cambió la voz o la velocidad."""
    if MANIFEST.is_file():
        previo = json.loads(MANIFEST.read_text(encoding="utf-8"))
        if previo.get("voz") == voz and previo.get("velocidad") == velocidad:
            return previo
    return {"voz": voz, "velocidad": velocidad, "frases": {}}


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="muestra qué se generaría, sin red")
    parser.add_argument("--solo", metavar="ID", help="genera solo la frase con ese id")
    args = parser.parse_args()

    datos = json.loads(CONTENIDO.read_text(encoding="utf-8"))
    voz, velocidad, frases = datos["voz"], datos["velocidad"], datos["frases"]
    ids = [f["id"] for f in frases]
    if args.solo and args.solo not in ids:
        print(f"No existe la frase «{args.solo}». Ids: {', '.join(ids)}", file=sys.stderr)
        return 2
    lista = [f for f in frases if not args.solo or f["id"] == args.solo]

    if args.dry_run:
        print(f"Voz {voz}, velocidad {velocidad}")
        for f in lista:
            print(f"  {f['id']}.mp3  ({len(f['texto'])} caracteres)  {f['texto']}")
        return 0

    SALIDA.mkdir(parents=True, exist_ok=True)
    manifest = leer_manifest(voz, velocidad) if args.solo else {"voz": voz, "velocidad": velocidad, "frases": {}}
    for f in lista:
        destino = SALIDA / f"{f['id']}.mp3"
        print(f"Generando {destino.relative_to(RAIZ).as_posix()} …", flush=True)
        await generar(f["texto"], destino, voz, velocidad)
        recortar_silencio_final(destino)
        dur = duracion_segundos(destino)
        manifest["frases"][f["id"]] = {"sha256": sha256(f["texto"]), "duracionSeg": dur}
        print(f"  {dur:.2f} s")

    # Mismo orden que el JSON y sin frases que ya no existen.
    manifest["frases"] = {i: manifest["frases"][i] for i in ids if i in manifest["frases"]}
    escribir_atomico(MANIFEST, json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Listo: {len(lista)} audio(s) con la voz {voz} ({velocidad}).")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
