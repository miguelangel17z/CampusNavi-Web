import { Audio } from "@remotion/media";
import { staticFile, useCurrentFrame } from "remotion";
import { material } from "./material";
import { MUSICA_DESDE_SEG, volumenMusica } from "./mezcla";
import { FPS } from "./tema";

/** Música de fondo desde el minuto 1:00 de la canción, con la curva de `mezcla.ts`. */
export const Musica = () => {
  const frame = useCurrentFrame();
  return (
    <Audio
      src={staticFile(material.musica.archivo)}
      trimBefore={MUSICA_DESDE_SEG * FPS}
      volume={volumenMusica(frame)}
    />
  );
};
