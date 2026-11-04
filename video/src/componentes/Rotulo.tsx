import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fuente } from "../fuente";
import { color } from "../tema";

type RotuloProps = {
  texto: string;
  detalle?: string;
  /** Duración del rótulo en frames (la misma de su <Sequence>). */
  duracion: number;
};

/**
 * Rótulo para la columna izquierda del cuadro (el clip vertical va a la derecha, x ≈ 1340).
 * Usa el frame relativo: móntalo dentro de una <Sequence durationInFrames={duracion}>.
 */
export const Rotulo = ({ texto, detalle, duracion }: RotuloProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrada en ~0,5 s: tarjeta, luego barra, luego texto.
  const tarjeta = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 15 });
  const barra = spring({ frame: frame - 3, fps, config: { damping: 200 }, durationInFrames: 14 });
  const textoIn = spring({ frame: frame - 5, fps, config: { damping: 200 }, durationInFrames: 12 });
  const detalleIn = spring({ frame: frame - 9, fps, config: { damping: 200 }, durationInFrames: 12 });

  // Salida en los últimos ~0,4 s.
  const salidaFrames = Math.round(fps * 0.4);
  const salida = interpolate(frame, [duracion - salidaFrames, duracion], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacidad = tarjeta * (1 - salida);
  const x = interpolate(tarjeta, [0, 1], [-60, 0]) - salida * 40;

  return (
    <div
      role="note"
      aria-label={detalle ? `${texto}. ${detalle}` : texto}
      style={{
        position: "absolute",
        left: 140,
        top: 600,
        transform: `translate(${x}px, -50%)`,
        opacity: opacidad,
        width: "max-content",
        // 800 px deja que «Una vuelta de 360°» quepa en una línea y termina en x = 940,
        // lejos del clip vertical (empieza en x ≈ 1036).
        maxWidth: 800,
        boxSizing: "border-box",
        padding: "36px 44px 38px 58px",
        borderRadius: 28,
        background: "rgba(12, 16, 48, 0.82)",
        border: `2px solid ${color.line}`,
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45), 0 0 60px rgba(124, 77, 255, 0.18)",
        fontFamily: fuente,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 12,
          background: `linear-gradient(180deg, ${color.violet}, ${color.violetStrong})`,
          transform: `scaleY(${barra})`,
          transformOrigin: "50% 0%",
        }}
      />
      <div
        style={{
          color: color.white,
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: "-0.025em",
          textWrap: "balance",
          opacity: textoIn,
          transform: `translateY(${(1 - textoIn) * 18}px)`,
        }}
      >
        {texto}
      </div>
      {detalle ? (
        <div
          style={{
            marginTop: 14,
            color: color.lilac,
            fontSize: 36,
            fontWeight: 600,
            lineHeight: 1.2,
            opacity: detalleIn,
            transform: `translateY(${(1 - detalleIn) * 14}px)`,
          }}
        >
          {detalle}
        </div>
      ) : null}
    </div>
  );
};
