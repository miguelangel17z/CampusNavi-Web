import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Fondo } from "../componentes/Fondo";
import { LogoAnimado } from "../componentes/Logo";
import { TituloLetras } from "../componentes/TituloLetras";
import { fuente } from "../fuente";
import { color, LEMA } from "../tema";

/** Intro (5 s): el logo se arma, «Campus Navi» letra a letra y el lema. Frame relativo. */
export const Intro = () => {
  const frame = useCurrentFrame();

  const lema = interpolate(frame, [78, 100], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Acercamiento muy lento de todo el bloque para que el plano no quede quieto.
  const zoom = interpolate(frame, [0, 150], [1, 1.035]);

  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          transform: `scale(${zoom})`,
        }}
      >
        <LogoAnimado tamano={280} />
        <div style={{ height: 56 }} />
        <TituloLetras texto="Campus Navi" resaltar="Navi" tamano={150} retraso={30} porLetra={2} />
        <div
          style={{
            marginTop: 28,
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
