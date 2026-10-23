import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  timeout: 15000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 800, height: 600 },
    actionTimeout: 10000,
    video: 'off',
  },
});
