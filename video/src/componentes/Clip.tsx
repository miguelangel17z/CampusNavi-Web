import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { material } from "../material";
import { volumenClip } from "../mezcla";
import { toma as buscarToma } from "../timeline";
import { ALTO, color, FPS } from "../tema";

const ALTO_CLIP = 940;
const CENTRO_X = 1340;
const FUNDIDO = 8;

/**
 * Un tramo de clip vertical a la derecha del cuadro, sobre una copia desenfocada.
 * Se monta dentro de <Sequence from={toma.inicio} durationInFrames={toma.duracion}>:
 * el frame relativo + toma.inicio da el frame absoluto que usa la mezcla.
 */
export const Clip = ({ tomaId }: { tomaId: string }) => {
  const frame = useCurrentFrame();
  const t = buscarToma(tomaId);
  const m = material[t.clip];
  const src = staticFile(m.archivo);
  const ancho = Math.round((ALTO_CLIP * m.ancho) / m.alto);

  const opacidad = interpolate(frame, [0, FUNDIDO, t.duracion - FUNDIDO, t.duracion], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [0, t.duracion], [1, 1.03]);
  const trimBefore = Math.round(t.desde * FPS);

  return (
    <AbsoluteFill style={{ opacity: opacidad }}>
      {/* Copia desenfocada y muda para llenar el cuadro horizontal. */}
      <AbsoluteFill style={{ opacity: 0.32, filter: "blur(48px) saturate(1.2)", transform: "scale(1.15)" }}>
        <Video src={src} trimBefore={trimBefore} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: `linear-gradient(90deg, ${color.night} 0%, rgba(5,8,22,0.75) 45%, rgba(5,8,22,0.2) 100%)` }}
      />
      <div
        style={{
          position: "absolute",
          left: CENTRO_X - ancho / 2,
          top: (ALTO - ALTO_CLIP) / 2,
          width: ancho,
          height: ALTO_CLIP,
          borderRadius: 36,
          overflow: "hidden",
          border: `3px solid ${color.lilac}`,
          boxShadow: `0 30px 90px rgba(0,0,0,0.55), 0 0 80px rgba(124,77,255,0.35)`,
          transform: `scale(${zoom})`,
        }}
      >
        <Video
          src={src}
          trimBefore={trimBefore}
          volume={volumenClip(tomaId, t.inicio + frame)}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </AbsoluteFill>
  );
};
