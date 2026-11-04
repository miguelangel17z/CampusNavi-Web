import axe from "axe-core";

/**
 * Corre axe-core sobre un contenedor renderizado en jsdom.
 * `color-contrast` se desactiva aquí porque jsdom no calcula estilos;
 * el contraste se verifica en las pruebas de Playwright sobre el sitio real.
 */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.map((v) => ({
    id: v.id,
    help: v.help,
    nodes: v.nodes.map((n) => n.html),
  }));
}
