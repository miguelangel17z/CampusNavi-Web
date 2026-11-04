import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color } from "../tema";

type FondoProps = {
  /** 0–1: opacidad del resplandor violeta. */
  intensidad?: number;
};

/** Fondo azul noche con un resplandor violeta que deriva muy despacio. */
export const Fondo = ({ intensidad = 0.55 }: FondoProps) => {
  const frame = useCurrentFrame();
  // Un ciclo completo cada ~20 s: casi imperceptible, pero da vida al fondo.
  const t = (frame / 600) * Math.PI * 2;
  const x = 50 + Math.sin(t) * 12;
  const y = 42 + Math.cos(t * 0.8) * 8;
  const x2 = 50 - Math.sin(t * 0.7) * 18;
  const a = Math.max(0, Math.min(1, intensidad));

  return (
    <AbsoluteFill style={{ backgroundColor: color.night }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at ${x}% ${y}%, rgba(91, 61, 245, ${0.55 * a}) 0%, rgba(124, 77, 255, ${0.18 * a}) 45%, rgba(5, 8, 22, 0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at ${x2}% 105%, rgba(124, 77, 255, ${0.28 * a}) 0%, rgba(5, 8, 22, 0) 70%)`,
        }}
      />
      {/* Viñeta para que los bordes queden oscuros y el centro respire. */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, rgba(5, 8, 22, 0) 55%, rgba(2, 3, 10, 0.75) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
