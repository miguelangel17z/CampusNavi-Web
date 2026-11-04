import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Clip } from "./componentes/Clip";
import { Fondo } from "./componentes/Fondo";
import { Rotulo } from "./componentes/Rotulo";
import { Cierre } from "./escenas/Cierre";
import { Intro } from "./escenas/Intro";
import { Musica } from "./Musica";
import { archivoNarracion, duracionNarracionFrames } from "./narracion";
import { escena, narraciones, rotulos, tomas } from "./timeline";
import { color } from "./tema";

const intro = escena("intro");
const cierre = escena("cierre");
/** Las escenas con clips van de «quiénes somos» a «usuario 3». */
const conClips = { inicio: escena("quienes").inicio, fin: cierre.inicio };

/** Composición principal: todo sale de timeline.ts y mezcla.ts. */
export const CampusNaviPromo = () => (
  <AbsoluteFill style={{ backgroundColor: color.night }}>
    <Sequence from={intro.inicio} durationInFrames={intro.duracion} name="Intro">
      <Intro />
    </Sequence>

    <Sequence from={conClips.inicio} durationInFrames={conClips.fin - conClips.inicio} name="Fondo de clips">
      <Fondo intensidad={0.4} />
    </Sequence>

    {tomas.map((t) => (
      <Sequence key={t.id} from={t.inicio} durationInFrames={t.duracion} premountFor={30} name={`Clip ${t.id}`}>
        <Clip tomaId={t.id} />
      </Sequence>
    ))}

    {rotulos.map((r) => (
      <Sequence key={r.id} from={r.inicio} durationInFrames={r.duracion} premountFor={15} name={`Rótulo ${r.id}`}>
        <Rotulo texto={r.texto} detalle={r.detalle} duracion={r.duracion} />
      </Sequence>
    ))}

    <Sequence from={cierre.inicio} durationInFrames={cierre.duracion} name="Cierre">
      <Cierre />
    </Sequence>

    {narraciones.map((n) => (
      <Sequence
        key={n.id}
        from={n.inicio}
        durationInFrames={duracionNarracionFrames(n.id)}
        premountFor={15}
        name={`Voz ${n.id}`}
      >
        <Audio src={staticFile(archivoNarracion(n.id))} />
      </Sequence>
    ))}

    <Musica />
  </AbsoluteFill>
);
