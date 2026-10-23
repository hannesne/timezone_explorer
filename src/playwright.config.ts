import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/browser',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
    viewport: { width: 800, height: 600 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
