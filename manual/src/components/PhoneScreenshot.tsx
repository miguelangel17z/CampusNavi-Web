import Image from "next/image";
import { capturas, type CapturaId } from "@/content/capturas";

type Props = {
  id: CapturaId;
  className?: string;
  /** Carga inmediata para la imagen principal de la página. */
  eager?: boolean;
};

/** Captura de la app dentro de un marco de celular. */
export function PhoneScreenshot({ id, className = "w-56", eager = false }: Props) {
  const c = capturas[id];
  return (
    <div
      className={`overflow-hidden rounded-[2rem] border-[6px] border-surface-2 bg-night shadow-[0_20px_60px_-20px_rgb(124_77_255/0.5)] ring-1 ring-line ${className}`}
    >
      <Image
        src={c.src}
        width={c.width}
        height={c.height}
        alt={c.alt}
        loading={eager ? "eager" : "lazy"}
        className="h-auto w-full"
      />
    </div>
  );
}
