import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sitio 100 % estático: `next build` genera HTML/CSS/JS en `out/`.
  // Vercel lo sirve tal cual y en la sustentación abre sin internet con `npx serve out`.
  output: "export",
  // `/manual-usuario` -> `/manual-usuario/index.html`, así funciona en cualquier servidor estático.
  trailingSlash: true,
  // La optimización de imágenes necesita servidor; las capturas ya son livianas.
  images: { unoptimized: true },
  // `cacheComponents` (PPR) no es compatible con `output: "export"`.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
