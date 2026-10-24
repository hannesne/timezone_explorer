import { test, expect } from '@playwright/test';

const TIMEZONES = [
  "UTC",
  "Pacific/Auckland",
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Kathmandu",
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders five labeled clocks with correct timezone attributes', async ({ page }) => {
  const clocks = await page.locator('[data-testid=timezone-clock]');
  await expect(clocks).toHaveCount(5);
  for (const timezone of TIMEZONES) {
    const clock = clocks.filter({ hasText: timezone });
    await expect(clock).toHaveCount(1);
    await expect(clock).toHaveAttribute('data-timezone', timezone);
    const dateEl = clock.locator('[data-testid=timezone-date]');
    const timeEl = clock.locator('[data-testid=timezone-time]');
    const dateText = await dateEl.textContent();
    const timeText = await timeEl.textContent();

    // Date must be YYYY-MM-DD
    expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Time must be HH:mm:ss 24h format
    expect(timeText).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  }
});

test('updates time every second', async ({ page }) => {
  // Extract initial time string for first clock
  const firstClock = page.locator('[data-testid=timezone-clock]').first();
  const timeEl = firstClock.locator('[data-testid=timezone-time]');

  const time1 = await timeEl.textContent();
  await page.waitForTimeout(1100);
  const time2 = await timeEl.textContent();

  expect(time1).not.toBe(time2);
});

test('refreshes on focus', async ({ page }) => {
  const firstClock = page.locator('[data-testid=timezone-clock]').first();
  const timeEl = firstClock.locator('[data-testid=timezone-time]');

  const time1 = await timeEl.textContent();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  const time2 = await timeEl.textContent();

  expect(time1).not.toBe(time2);
});

test('refreshes on visibility change', async ({ page }) => {
  const firstClock = page.locator('[data-testid=timezone-clock]').first();
  const timeEl = firstClock.locator('[data-testid=timezone-time]');

  const time1 = await timeEl.textContent();
  await page.evaluate(() => document.visibilityState = 'hidden');
  await page.waitForTimeout(500);
  await page.evaluate(() => document.visibilityState = 'visible');

  const time2 = await timeEl.textContent();

  expect(time1).not.toBe(time2);
});
