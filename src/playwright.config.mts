import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  timeout: 30000,
  fullyParallel: true,
  use: {
    headless: true,
    viewport: { width: 800, height: 600 },
    ignoreHTTPSErrors: true,
    video: 'off',
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:3000',
  },
});
