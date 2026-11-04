/**
 * Funciones que NO existen todavía para el usuario final y que no se deben mencionar
 * en la Home ni en el manual del usuario (ni siquiera como "próximamente").
 */
export const PALABRAS_PROHIBIDAS =
  /\b(guiad\w*|gu[ií]a por voz|navegaci[oó]n|ir a un lugar|rutas?|destinos?|pr[oó]ximamente|llegada)\b/i;

export function buscarPalabrasProhibidas(texto: string) {
  const g = new RegExp(PALABRAS_PROHIBIDAS.source, "gi");
  return [...texto.matchAll(g)].map((m) => m[0]);
}
