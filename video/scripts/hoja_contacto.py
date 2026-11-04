"""Hoja de contacto de un clip para revisar tramos (solo uso interno del equipo).

Uso: python scripts/hoja_contacto.py public/material/usuario1.mp4 out/revision/u1.jpg --desde 0 --hasta 56 --cada 4
Usa el ffmpeg incluido con Remotion (no tiene filtros fps/tile, por eso se extrae fotograma por fotograma).
"""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

FFMPEG = Path(__file__).resolve().parent.parent / "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("video")
    p.add_argument("salida")
    p.add_argument("--desde", type=float, default=0)
    p.add_argument("--hasta", type=float, required=True)
    p.add_argument("--cada", type=float, default=4)
    p.add_argument("--ancho", type=int, default=170)
    p.add_argument("--columnas", type=int, default=8)
    a = p.parse_args()

    tiempos = []
    t = a.desde
    while t <= a.hasta:
        tiempos.append(round(t, 2))
        t += a.cada

    cuadros: list[tuple[float, Image.Image]] = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(tiempos):
            f = Path(tmp) / f"{i}.jpg"
            subprocess.run(
                [str(FFMPEG), "-v", "error", "-y", "-ss", str(t), "-i", a.video, "-frames:v", "1", "-q:v", "4", str(f)],
                check=True,
            )
            if f.exists():
                img = Image.open(f).convert("RGB")
                alto = round(img.height * a.ancho / img.width)
                cuadros.append((t, img.resize((a.ancho, alto))))

    w, h = cuadros[0][1].size
    filas = -(-len(cuadros) // a.columnas)
    hoja = Image.new("RGB", (w * a.columnas, h * filas), "black")
    dib = ImageDraw.Draw(hoja)
    for i, (t, img) in enumerate(cuadros):
        x, y = (i % a.columnas) * w, (i // a.columnas) * h
        hoja.paste(img, (x, y))
        etiqueta = f"{int(t // 60)}:{t % 60:04.1f}"
        dib.rectangle([x, y, x + 58, y + 16], fill="black")
        dib.text((x + 3, y + 2), etiqueta, fill="yellow")
    Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
    hoja.save(a.salida, quality=85)
    print("ok", a.salida, len(cuadros), "cuadros")


if __name__ == "__main__":
    main()
