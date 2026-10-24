import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
    viewport: { width: 600, height: 400 },
    ignoreHTTPSErrors: true,
    video: 'off',
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
});
