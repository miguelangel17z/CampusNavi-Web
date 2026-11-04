import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Fondo } from "../componentes/Fondo";
import { LogoAnimado } from "../componentes/Logo";
import { TituloLetras } from "../componentes/TituloLetras";
import { fuente } from "../fuente";
import { color, FIRMA, LEMA } from "../tema";

const aparece = (frame: number, desde: number, hasta: number) =>
  interpolate(frame, [desde, hasta], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Cierre (8 s): logo, «Campus Navi», lema y firma del equipo; fundido a negro al final. Frame relativo. */
export const Cierre = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const lema = aparece(frame, 45, 65);
  const firma = aparece(frame, 70, 90);
  const fundidoFrames = Math.round(fps * 0.8);
  const negro = interpolate(frame, [durationInFrames - fundidoFrames, durationInFrames - 1], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Fondo intensidad={0.7} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <LogoAnimado tamano={230} />
        <div style={{ height: 48 }} />
        <TituloLetras texto="Campus Navi" resaltar="Navi" tamano={130} retraso={14} porLetra={2} />
        <div
          style={{
            marginTop: 24,
            fontFamily: fuente,
            fontSize: 46,
            fontWeight: 600,
            color: color.white,
            opacity: lema * 0.92,
            transform: `translateY(${(1 - lema) * 20}px)`,
          }}
        >
          {LEMA}
        </div>
        <div
          style={{
            marginTop: 64,
            fontFamily: fuente,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: color.lilac,
            opacity: firma,
            transform: `translateY(${(1 - firma) * 14}px)`,
          }}
        >
          {FIRMA}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: negro }} />
    </AbsoluteFill>
  );
};
