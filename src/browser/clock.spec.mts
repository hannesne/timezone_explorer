import { test, expect } from '@playwright/test';

test.describe('Clock timezones UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays five labelled clocks with correct timezone attributes', async ({ page }) => {
    const clocks = await page.locator('[data-testid="timezone-clock"]');
    await expect(clocks).toHaveCount(5);
    const expectedTimezones = [
      'UTC',
      'Pacific/Auckland',
      'America/New_York',
      'Asia/Kolkata',
      'Asia/Kathmandu'
    ];
    for (const timezone of expectedTimezones) {
      const clock = clocks.filter({ hasText: timezone });
      await expect(clock).toHaveCount(1);
      await expect(clock).toHaveAttribute('data-timezone', timezone);

      const date = clock.locator('[data-testid="timezone-date"]');
      const time = clock.locator('[data-testid="timezone-time"]');

      await expect(date).toHaveText(/\d{4}-\d{2}-\d{2}/);
      await expect(time).toHaveText(/\d{2}:\d{2}:\d{2}/);
    }
  });

  test('updates time every second visibly', async ({ page }) => {
    const timesBefore = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );
    await page.waitForTimeout(1100);
    await page.reload();
    const timesAfter = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );
    // Times should not be exactly equal after reload and wait
    expect(timesBefore.some((t, i) => t !== timesAfter[i])).toBe(true);
  });

  test('refreshes on window focus event', async ({ page }) => {
    // Capture time before focus
    const timesBefore = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );

    // Trigger window blur and then focus event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });

    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });

    // Capture time after focus
    const timesAfter = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );

    // Times should differ after focus event triggers a refresh
    expect(timesBefore.some((t, i) => t !== timesAfter[i])).toBe(true);
  });

  test('refreshes on visibility change to visible', async ({ page }) => {
    const timesBefore = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );

    // Simulate tab hidden and then visible
    await page.evaluate(() => {
      document.visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
      document.visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    });

    const timesAfter = await Promise.all(
      (await page.locator('[data-testid="timezone-time"]').all())
        .map(async el => el.textContent())
    );

    expect(timesBefore.some((t, i) => t !== timesAfter[i])).toBe(true);
  });
});
