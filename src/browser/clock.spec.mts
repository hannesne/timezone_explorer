import { test, expect } from '@playwright/test';

test.describe('Timezone Explorer Clocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const timezones = [
    'UTC',
    'Pacific/Auckland',
    'America/New_York',
    'Asia/Kolkata',
    'Asia/Kathmandu'
  ];

  test('renders all five fixed clocks with labels and valid times', async ({ page }) => {
    for (const tz of timezones) {
      const clock = page.getByTestId('timezone-clock').filter({ hasText: tz });
      await expect(clock).toBeVisible();
      await expect(clock).toHaveAttribute('data-timezone', tz);
      const dateElem = clock.getByTestId('timezone-date');
      const timeElem = clock.getByTestId('timezone-time');
      await expect(dateElem).toHaveText(/\d{4}-\d{2}-\d{2}/);
      await expect(timeElem).toHaveText(/\d{2}:\d{2}:\d{2}/);
    }
  });

  test('updates every second and on focus/visibility', async ({ page }) => {
    const firstTimes: string[] = [];
    for (const tz of timezones) {
      const clock = page.getByTestId('timezone-clock').filter({ hasText: tz });
      const timeElem = clock.getByTestId('timezone-time');
      firstTimes.push(await timeElem.textContent() || '');
    }
    await page.waitForTimeout(1100);
    const secondTimes: string[] = [];
    for (const tz of timezones) {
      const clock = page.getByTestId('timezone-clock').filter({ hasText: tz });
      const timeElem = clock.getByTestId('timezone-time');
      secondTimes.push(await timeElem.textContent() || '');
    }
    // Expect at least one change among the five clocks after one second
    const changed = secondTimes.some((t, i) => t !== firstTimes[i]);
    expect(changed).toBe(true);

    // Simulate document hidden and visible to test visibility refresh
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    const refreshedTimes: string[] = [];
    for (const tz of timezones) {
      const clock = page.getByTestId('timezone-clock').filter({ hasText: tz });
      const timeElem = clock.getByTestId('timezone-time');
      refreshedTimes.push(await timeElem.textContent() || '');
    }
    expect(refreshedTimes.some((t, i) => t !== secondTimes[i])).toBe(true);
  });
});
