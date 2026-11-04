import { defineConfig, devices } from "@playwright/test";

// Pruebas de punta a punta contra el sitio estático ya construido (`out/`).
// `npm run test:e2e` construye y luego corre; `npm run e2e` usa el `out/` existente.
const PUERTO = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    // Celular Android, como el que usa la persona con TalkBack.
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx serve out -l ${PUERTO} --no-clipboard`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
