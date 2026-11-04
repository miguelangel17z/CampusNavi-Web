import { AbsoluteFill, Composition, Folder } from "remotion";
import { CampusNaviPromo } from "./CampusNaviPromo";
import { DURACION_TOTAL, escena, rotulos } from "./timeline";
import { ALTO, ANCHO, FPS } from "./tema";
import { Fondo } from "./componentes/Fondo";
import { Rotulo } from "./componentes/Rotulo";
import { Intro } from "./escenas/Intro";
import { Cierre } from "./escenas/Cierre";

const vuelta = rotulos.find((r) => r.id === "vuelta")!;
const largo = rotulos.find((r) => r.id === "talkback")!;

/** Solo para revisar el rótulo aislado (uno corto y uno con detalle). */
const RotuloRevision = () => (
  <AbsoluteFill>
    <Fondo />
    <Rotulo texto={vuelta.texto} detalle={vuelta.detalle} duracion={vuelta.duracion} />
    <div style={{ position: "absolute", inset: 0, transform: "translateY(-300px)" }}>
      <Rotulo texto={largo.texto} detalle={largo.detalle} duracion={vuelta.duracion} />
    </div>
  </AbsoluteFill>
);

export const RemotionRoot = () => (
  <>
    <Composition
      id="CampusNaviPromo"
      component={CampusNaviPromo}
      durationInFrames={DURACION_TOTAL}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
    />
    <Folder name="Revision">
      <Composition
        id="IntroRevision"
        component={Intro}
        durationInFrames={escena("intro").duracion}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="CierreRevision"
        component={Cierre}
        durationInFrames={escena("cierre").duracion}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
      <Composition
        id="RotuloRevision"
        component={RotuloRevision}
        durationInFrames={vuelta.duracion}
        fps={FPS}
        width={ANCHO}
        height={ALTO}
      />
    </Folder>
  </>
);
