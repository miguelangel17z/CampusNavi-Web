import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { AudioButton, duracionEnPalabras } from "@/components/audio/AudioButton";
import ManualUsuarioPage from "@/app/manual-usuario/page";
import { axeViolations } from "./axe";

/** jsdom no reproduce audio: se simulan play/pause y se registran las llamadas. */
const llamadas: { accion: "play" | "pause"; src: string }[] = [];
let playFalla: Error | null = null;

beforeEach(() => {
  llamadas.length = 0;
  playFalla = null;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    llamadas.push({ accion: "play", src: this.getAttribute("src") ?? "" });
    return playFalla ? Promise.reject(playFalla) : Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    llamadas.push({ accion: "pause", src: this.getAttribute("src") ?? "" });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Dos() {
  return (
    <AudioProvider>
      <AudioButton src="/audio/uno.mp3" etiqueta="paso 1" descripcion="Antes de empezar" duracion={20} />
      <AudioButton src="/audio/dos.mp3" etiqueta="paso 2" descripcion="Abre la app" duracion={65} />
    </AudioProvider>
  );
}

describe("AudioButton", () => {
  it("el nombre accesible empieza con el texto visible e incluye título y duración", () => {
    render(<Dos />);
    const boton = screen.getByRole("button", { name: "Escuchar paso 1: Antes de empezar, 20 segundos" });
    expect(boton).toHaveTextContent("Escuchar paso 1");
  });

  it("no reproduce nada sin que la persona lo pida", () => {
    render(<Dos />);
    expect(llamadas.filter((l) => l.accion === "play")).toEqual([]);
  });

  it("reproduce y luego pausa el mismo audio", async () => {
    const user = userEvent.setup();
    render(<Dos />);
    await user.click(screen.getByRole("button", { name: /^Escuchar paso 1/ }));
    expect(llamadas.at(-1)).toEqual({ accion: "play", src: "/audio/uno.mp3" });

    const pausar = await screen.findByRole("button", { name: /^Pausar paso 1/ });
    await user.click(pausar);
    expect(llamadas.at(-1)).toEqual({ accion: "pause", src: "/audio/uno.mp3" });
    expect(screen.getByRole("status")).toHaveTextContent("En pausa: paso 1.");
    expect(screen.getByRole("button", { name: /^Escuchar paso 1/ })).toBeInTheDocument();
  });

  it("al iniciar otro audio detiene el anterior (solo suena uno)", async () => {
    const user = userEvent.setup();
    render(<Dos />);
    await user.click(screen.getByRole("button", { name: /^Escuchar paso 1/ }));
    await user.click(screen.getByRole("button", { name: /^Escuchar paso 2/ }));

    expect(llamadas.slice(-2)).toEqual([
      { accion: "pause", src: "/audio/uno.mp3" },
      { accion: "play", src: "/audio/dos.mp3" },
    ]);
    expect(screen.getByRole("button", { name: /^Escuchar paso 1/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Pausar paso 2/ })).toBeInTheDocument();
  });

  it("si el audio falla, lo anuncia y ofrece el MP3 como respaldo", async () => {
    playFalla = new DOMException("no soportado", "NotSupportedError");
    const user = userEvent.setup();
    render(<Dos />);
    await user.click(screen.getByRole("button", { name: /^Escuchar paso 2/ }));

    expect(await screen.findByRole("status")).toHaveTextContent("No se pudo reproducir el audio de paso 2.");
    expect(screen.getByRole("link", { name: "Abrir el audio de paso 2 en MP3" })).toHaveAttribute(
      "href",
      "/audio/dos.mp3",
    );
  });

  it("anuncia cuando el audio termina", async () => {
    const user = userEvent.setup();
    const { container } = render(<Dos />);
    await user.click(screen.getByRole("button", { name: /^Escuchar paso 1/ }));
    // El reproductor no está en el DOM: se dispara `ended` sobre la instancia creada por el provider.
    const audio = (HTMLMediaElement.prototype.play as unknown as { mock: { contexts: HTMLMediaElement[] } }).mock
      .contexts[0];
    act(() => {
      audio.dispatchEvent(new Event("ended"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("Terminó el audio de paso 1.");
    expect(container).toBeTruthy();
  });

  it("dice la duración en palabras", () => {
    expect(duracionEnPalabras(20)).toBe("20 segundos");
    expect(duracionEnPalabras(60)).toBe("1 minuto");
    expect(duracionEnPalabras(230)).toBe("3 minutos 50 segundos");
  });
});

describe("manual del usuario con audio", () => {
  it("cada paso tiene su botón de audio, más el del manual completo", () => {
    render(<ManualUsuarioPage />);
    const botones = screen.getAllByRole("button", { name: /^Escuchar/ });
    expect(botones[0]).toHaveAccessibleName(/^Escuchar el manual completo: 3 minutos/);
    const nombres = botones.slice(1).map((b) => b.getAttribute("aria-label") ?? "");
    expect(nombres).toHaveLength(7);
    nombres.forEach((nombre, i) => expect(nombre).toMatch(new RegExp(`^Escuchar paso ${i + 1}: .+, \\d+ segundos$`)));
  });

  it("no tiene violaciones de accesibilidad", async () => {
    const { container } = render(<ManualUsuarioPage />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
