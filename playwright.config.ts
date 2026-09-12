import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT ?? 4173);
const DIST = process.env.PW_DIST ?? 'dist';
export const BASE = `http://localhost:${PORT}/valeo-site/`;

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: BASE, trace: 'retain-on-failure', browserName: 'chromium' },
  testMatch: process.env.PW_R7 ? /r7\.spec\.ts/ : /(shop|checkout|home)\.spec\.ts/,
  webServer: {
    command: `npx vite preview --outDir ${DIST} --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, grepInvert: /mobile-only/ },
  ],
});
