import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './browser',
  use: {
    headless: true,
    viewport: { width: 480, height: 360 },
  },
  reporter: [['list'], ['json', { outputFile: 'playwright-report.json' }]],
  forbidOnly: true,
  retries: 0,
  workers: 1,
});
