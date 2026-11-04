"""Genera los audios del manual del usuario con edge-tts.

Lee `src/content/usuario.json` (la misma fuente que la página) y escribe:
  - public/audio/<id>.mp3     un audio por paso
  - public/audio/completo.mp3 el manual completo
  - public/audio/manifest.json hash del texto narrado en cada audio (lo usa la prueba
    `tests/audios.test.ts` para detectar audios desactualizados)

Uso:
  python -m venv .venv
  .venv/Scripts/pip install edge-tts==7.3.1   (Windows)   |   .venv/bin/pip install edge-tts==7.3.1
  .venv/Scripts/python scripts/generate_audio.py [--voz es-CO-GonzaloNeural] [--velocidad -5%] [--dry-run]

Requiere internet (edge-tts usa el servicio de voz en línea de Microsoft Edge).
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / "src" / "content" / "usuario.json"
SALIDA = RAIZ / "public" / "audio"
VOZ_POR_DEFECTO = "es-CO-SalomeNeural"
VELOCIDAD_POR_DEFECTO = "-5%"


# --- Narración. DEBE coincidir con `narracionPaso` y `narracionCompleta` de src/content/usuario.ts ---

def titulo_paso(paso: dict, indice: int) -> str:
    return f"Paso {indice + 1}. {paso['titulo']}"


def narracion_paso(paso: dict, indice: int) -> str:
    partes = [f"{titulo_paso(paso, indice)}.", *paso["parrafos"], *paso.get("lista", []), *paso.get("despues", [])]
    if paso.get("oiras"):
        partes += ["La app te dirá:", *paso["oiras"]]
    return " ".join(partes)


def narracion_completa(manual: dict) -> str:
    pasos = [narracion_paso(p, i) for i, p in enumerate(manual["pasos"])]
    return " ".join([manual["titulo"] + ".", manual["intro"], *pasos, manual["cierre"]])


def sha256(texto: str) -> str:
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


# --- Generación ---

BITRATE_EDGE_TTS = 48_000  # edge-tts entrega MP3 mono de 24 kHz a 48 kbit/s


def duracion_segundos(mp3: Path) -> int:
    """Duración aproximada a partir del tamaño (bitrate constante)."""
    return round(mp3.stat().st_size * 8 / BITRATE_EDGE_TTS)


def trabajos(manual: dict) -> list[tuple[str, str]]:
    """Lista de (nombre de archivo sin extensión, texto a narrar)."""
    lista = [(p["id"], narracion_paso(p, i)) for i, p in enumerate(manual["pasos"])]
    lista.append(("completo", narracion_completa(manual)))
    return lista


async def generar(texto: str, destino: Path, voz: str, velocidad: str) -> None:
    import edge_tts  # importación tardía: --dry-run no necesita la librería

    tmp = destino.with_suffix(".tmp")
    await edge_tts.Communicate(texto, voz, rate=velocidad).save(str(tmp))
    tmp.replace(destino)


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--voz", default=VOZ_POR_DEFECTO, help=f"voz de edge-tts (por defecto {VOZ_POR_DEFECTO})")
    parser.add_argument("--velocidad", default=VELOCIDAD_POR_DEFECTO, help="por ejemplo -10%%, +0%%")
    parser.add_argument("--dry-run", action="store_true", help="muestra qué se generaría, sin generar")
    args = parser.parse_args()

    manual = json.loads(CONTENIDO.read_text(encoding="utf-8"))
    lista = trabajos(manual)

    if args.dry_run:
        for nombre, texto in lista:
            print(f"{nombre}.mp3  ({len(texto)} caracteres)\n    {texto[:110]}…")
        return 0

    SALIDA.mkdir(parents=True, exist_ok=True)
    manifest: dict = {"voz": args.voz, "velocidad": args.velocidad, "audios": {}, "duraciones": {}}
    for nombre, texto in lista:
        destino = SALIDA / f"{nombre}.mp3"
        print(f"Generando {destino.relative_to(RAIZ)} …", flush=True)
        await generar(texto, destino, args.voz, args.velocidad)
        manifest["audios"][nombre] = sha256(texto)
        manifest["duraciones"][nombre] = duracion_segundos(destino)

    (SALIDA / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Listo: {len(lista)} audios con la voz {args.voz}.")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
