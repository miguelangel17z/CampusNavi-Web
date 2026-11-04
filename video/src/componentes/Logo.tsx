import { useId } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../tema";

/**
 * Logo de Campus Navi: pin con degradado y órbita elíptica rotada (misma geometría que
 * manual/src/components/Logo.tsx), sobre el orbe de la app (.orb en globals.css).
 */

type Progreso = {
  /** 0–1: aparición del halo (orbe). */
  halo: number;
  /** Escala extra del halo para el latido (1 = reposo). */
  latido: number;
  /** 0–1 (con rebote): entrada del pin. */
  pin: number;
  /** 0–1: trazo dibujado de la órbita. */
  orbita: number;
  /** 0–1 (con rebote): punto interior. */
  punto: number;
};

const LogoDibujo = ({ tamano, p }: { tamano: number; p: Progreso }) => {
  // Los id de SVG deben ser únicos por instancia y válidos dentro de url(#…).
  const id = `pin-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const lado = tamano * 0.72;
  const opacidadPin = Math.min(1, Math.max(0, p.pin * 2.5));
  const escalaPin = interpolate(p.pin, [0, 1], [0.35, 1]);
  const caida = interpolate(p.pin, [0, 1], [-tamano * 0.35, 0]);
  const opacidadHalo = Math.min(1, Math.max(0, p.halo));
  const escalaHalo = interpolate(p.halo, [0, 1], [0.6, 1]) * p.latido;

  return (
    <div style={{ position: "relative", width: tamano, height: tamano }}>
      {/* Orbe: degradado radial violeta con borde lila y resplandor. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, #1d1060 0%, #2a1678 46%, #5b3df5 80%, #7c4dff 100%)",
          border: `${Math.max(2, tamano * 0.016)}px solid ${color.lilac}`,
          boxShadow: `0 0 ${tamano * 0.23}px rgba(124, 77, 255, 0.55), 0 0 ${tamano * 0.54}px rgba(124, 77, 255, 0.25)`,
          opacity: opacidadHalo,
          transform: `scale(${escalaHalo})`,
        }}
      />
      <svg
        viewBox="0 0 64 64"
        width={lado}
        height={lado}
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          left: (tamano - lado) / 2,
          top: (tamano - lado) / 2,
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#5b3df5" />
          </linearGradient>
        </defs>
        <ellipse
          cx="32"
          cy="30"
          rx="28"
          ry="10"
          fill="none"
          stroke={color.lilac}
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p.orbita}
          // Sin esto, el extremo redondo del trazo recién empezado se ve como un punto suelto.
          opacity={interpolate(p.orbita, [0.03, 0.15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          transform="rotate(-18 32 30)"
        />
        <g
          style={{
            opacity: opacidadPin,
            transform: `translateY(${(caida / lado) * 64}px) scale(${escalaPin})`,
            transformOrigin: "32px 56px",
          }}
        >
          <path d="M32 4c-10 0-18 8-18 18 0 13 18 34 18 34s18-21 18-34C50 12 42 4 32 4z" fill={`url(#${id})`} />
          <circle cx="32" cy="21" r="7" fill={color.night} />
          <circle
            cx="32"
            cy="21"
            r={3 * Math.max(0, p.punto)}
            fill={color.lilac}
            opacity={Math.min(1, Math.max(0, p.punto))}
          />
        </g>
      </svg>
    </div>
  );
};

type LogoAnimadoProps = {
  /** Lado del cuadro en px (el orbe ocupa todo el cuadro). */
  tamano?: number;
  /** Frames de espera antes de empezar. */
  retraso?: number;
};

/** Logo que se arma: orbe, caída del pin con rebote, trazo de la órbita y punto final; luego late. */
export const LogoAnimado = ({ tamano = 260, retraso = 0 }: LogoAnimadoProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - retraso;

  const halo = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 20 });
  const pin = spring({ frame: f - 6, fps, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const orbita = interpolate(f, [16, 42], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const punto = spring({ frame: f - 40, fps, config: { damping: 10, stiffness: 180 } });
  // Latido como el .orb del sitio: 1 → 1,04 → 1 cada 3,2 s, solo cuando el logo ya está armado.
  const ciclo = fps * 3.2;
  const latido = f > 45 ? 1 + 0.02 * (1 - Math.cos(((f - 45) / ciclo) * Math.PI * 2)) : 1;

  return <LogoDibujo tamano={tamano} p={{ halo, latido, pin, orbita, punto }} />;
};

/** Logo completo sin animación. */
export const LogoEstatico = ({ tamano = 260 }: { tamano?: number }) => (
  <LogoDibujo tamano={tamano} p={{ halo: 1, latido: 1, pin: 1, orbita: 1, punto: 1 }} />
);
