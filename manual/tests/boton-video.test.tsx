import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BotonVideo } from "@/components/BotonVideo";
import { PromoVideo } from "@/components/PromoVideo";
import { axeViolations } from "./axe";

/** jsdom no reproduce video: play/pause se simulan y disparan los eventos como el navegador. */
let playFalla: Error | null = null;

beforeEach(() => {
  playFalla = null;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    if (playFalla) return Promise.reject(playFalla);
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    this.dispatchEvent(new Event("pause"));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function ConVideo() {
  return (
    <>
      <BotonVideo videoId="v" duracion="1 minuto 22 segundos" />
      <video id="v" controls />
    </>
  );
}

describe("BotonVideo", () => {
  it("su nombre empieza con el texto visible e incluye de qué trata y cuánto dura", () => {
    render(<ConVideo />);
    const b = screen.getByRole("button", {
      name: "Reproducir video: presentación de Campus Navi, 1 minuto 22 segundos, con subtítulos",
    });
    expect(b).toHaveTextContent("Reproducir video");
    expect(b).toHaveAttribute("aria-controls", "v");
  });

  it("no reproduce nada sin que la persona lo pida", () => {
    render(<ConVideo />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("reproduce, pausa y ofrece seguir viendo", async () => {
    const user = userEvent.setup();
    render(<ConVideo />);
    await user.click(screen.getByRole("button", { name: /^Reproducir video/ }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    await user.click(await screen.findByRole("button", { name: "Pausar video" }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Video en pausa.");
    expect(screen.getByRole("button", { name: /^Seguir viendo el video/ })).toBeInTheDocument();
  });

  it("se sincroniza si se usan los controles del propio video", () => {
    const { container } = render(<ConVideo />);
    const v = container.querySelector("video")!;
    act(() => {
      v.dispatchEvent(new Event("play"));
    });
    expect(screen.getByRole("button", { name: "Pausar video" })).toBeInTheDocument();
  });

  it("anuncia cuando termina y vuelve a «Reproducir video»", () => {
    const { container } = render(<ConVideo />);
    const v = container.querySelector("video")!;
    act(() => {
      v.dispatchEvent(new Event("play"));
      v.dispatchEvent(new Event("ended"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Terminó el video.");
    expect(screen.getByRole("button", { name: /^Reproducir video/ })).toBeInTheDocument();
  });

  it("si falla, lo anuncia y remite a la transcripción", async () => {
    playFalla = new DOMException("no soportado", "NotSupportedError");
    const user = userEvent.setup();
    render(<ConVideo />);
    await user.click(screen.getByRole("button", { name: /^Reproducir video/ }));
    expect(await screen.findByRole("status")).toHaveTextContent(/No se pudo reproducir el video.*transcripción/);
  });
});

describe("PromoVideo con el botón", () => {
  it("el botón va antes del video y controla ese video", () => {
    const { container } = render(<PromoVideo />);
    const boton = screen.getByRole("button", { name: /^Reproducir video/ });
    const video = container.querySelector("video")!;
    expect(boton.compareDocumentPosition(video) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(boton).toHaveAttribute("aria-controls", video.id);
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<PromoVideo />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
