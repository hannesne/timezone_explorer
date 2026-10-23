import { test, expect } from '@playwright/test';

const TIMEZONES = [
  'UTC',
  'Pacific/Auckland',
  'America/New_York',
  'Asia/Kolkata',
  'Asia/Kathmandu',
];

// Helper to parse time string HH:mm:ss
function parseTime(timeString: string) {
  const [h, m, s] = timeString.split(':').map(Number);
  return { h, m, s };
}

test.describe('Timezone Explorer Clocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders exactly 5 clocks with correct labels and format', async ({ page }) => {
    const clockRows = await page.locator('[data-testid="timezone-clock"]');
    await expect(clockRows).toHaveCount(TIMEZONES.length);

    for (const tz of TIMEZONES) {
      const row = await page.locator(`[data-testid="timezone-clock"][data-timezone="${tz}"]`);
      await expect(row).toBeVisible();
      await expect(row.locator('span', { hasText: tz })).toBeVisible();
      const dateElem = row.locator('[data-testid="timezone-date"]');
      const timeElem = row.locator('[data-testid="timezone-time"]');
      await expect(dateElem).toBeVisible();
      await expect(timeElem).toBeVisible();

      const dateText = await dateElem.textContent();
      const timeText = await timeElem.textContent();

      // Check date format YYYY-MM-DD
      expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Check time format HH:mm:ss 24-hour
      expect(timeText).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    }
  });

  test('time updates every second', async ({ page }) => {
    const row = await page.locator('[data-testid="timezone-clock"][data-timezone="UTC"]');
    const timeElem = row.locator('[data-testid="timezone-time"]');

    const time1 = await timeElem.textContent();
    await page.waitForTimeout(1100);
    const time2 = await timeElem.textContent();

    expect(time1).not.toBe(time2);
  });

  test('refreshes on window focus', async ({ page }) => {
    const row = await page.locator('[data-testid="timezone-clock"][data-timezone="UTC"]');
    const timeElem = row.locator('[data-testid="timezone-time"]');
    const timeBefore = await timeElem.textContent();

    // Simulate focus event
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    const timeAfter = await timeElem.textContent();

    expect(timeBefore).not.toBe(timeAfter);
  });

  test('refreshes on visibility change to visible', async ({ page }) => {
    const row = await page.locator('[data-testid="timezone-clock"][data-timezone="UTC"]');
    const timeElem = row.locator('[data-testid="timezone-time"]');

    const timeBefore = await timeElem.textContent();

    // Make page hidden then visible
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const timeAfter = await timeElem.textContent();

    expect(timeBefore).not.toBe(timeAfter);
  });
});
