import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fuente } from "../fuente";
import { color as paleta } from "../tema";

type TituloLetrasProps = {
  texto: string;
  /** Frames antes de la primera letra. */
  retraso?: number;
  /** Frames entre una letra y la siguiente. */
  porLetra?: number;
  /** Tamaño de letra en px. */
  tamano?: number;
  peso?: number;
  color?: string;
  /** Palabra (o fragmento) del texto que se pinta en lila, p. ej. «Navi». */
  resaltar?: string;
};

/** Título que aparece letra por letra (opacidad, subida y desenfoque que se disipa). */
export const TituloLetras = ({
  texto,
  retraso = 0,
  porLetra = 2,
  tamano = 120,
  peso = 800,
  color = paleta.white,
  resaltar,
}: TituloLetrasProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letras = Array.from(texto);

  // Rango [desde, hasta) de letras resaltadas, en índices de `letras`.
  let desde = -1;
  let hasta = -1;
  if (resaltar) {
    const i = texto.indexOf(resaltar);
    if (i >= 0) {
      desde = Array.from(texto.slice(0, i)).length;
      hasta = desde + Array.from(resaltar).length;
    }
  }

  return (
    <div
      role="heading"
      aria-level={1}
      aria-label={texto}
      style={{
        fontFamily: fuente,
        fontSize: tamano,
        fontWeight: peso,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color,
        whiteSpace: "pre",
        textAlign: "center",
      }}
    >
      {letras.map((letra, i) => {
        const p = spring({
          frame: frame - retraso - i * porLetra,
          fps,
          config: { damping: 16, stiffness: 120, mass: 0.7 },
        });
        const visible = Math.min(1, Math.max(0, p));
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: visible,
              transform: `translateY(${(1 - p) * tamano * 0.35}px)`,
              filter: visible < 1 ? `blur(${(1 - visible) * tamano * 0.08}px)` : undefined,
              color: i >= desde && i < hasta ? paleta.lilac : undefined,
            }}
          >
            {letra}
          </span>
        );
      })}
    </div>
  );
};
