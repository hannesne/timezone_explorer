import { afterAll, beforeAll, expect, test } from "vitest";
import { chromium } from "@playwright/test";
import { WINTER, assertRow, openClock } from "./browser-helpers.mjs";

let browser;
beforeAll(async () => { browser = await chromium.launch(); });
afterAll(async () => { if (browser) await browser.close(); });

for (const [zone, date, time] of WINTER) {
  test(`fixed winter ${zone}`, async () => {
    const page = await browser.newPage();
    try {
      await openClock(page, "2026-01-15T12:00:00Z");
      await assertRow(page, zone, date, time);
    } finally { await page.close(); }
  });
}
test("New York summer DST", async () => {
  const page = await browser.newPage();
  try {
    await openClock(page, "2026-07-15T12:00:00Z");
    await assertRow(page, "America/New_York", "2026-07-15", "08:00:00");
  } finally { await page.close(); }
});
test("invalid IANA input is an explicit error, not UTC", async () => {
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      const Original = Intl.DateTimeFormat;
      Intl.DateTimeFormat = new Proxy(Original, {
        construct(target, args) {
          if (args[1]?.timeZone === "Asia/Kathmandu") throw new RangeError("Invalid time zone: acceptance-invalid/IANA");
          return Reflect.construct(target, args);
        },
        apply(target, receiver, args) {
          if (args[1]?.timeZone === "Asia/Kathmandu") throw new RangeError("Invalid time zone: acceptance-invalid/IANA");
          return Reflect.apply(target, receiver, args);
        },
      });
      for (const name of ["toLocaleString", "toLocaleDateString", "toLocaleTimeString"]) {
        const original = Date.prototype[name];
        Date.prototype[name] = function (...args) {
          if (args[1]?.timeZone === "Asia/Kathmandu") throw new RangeError("Invalid time zone: acceptance-invalid/IANA");
          return Reflect.apply(original, this, args);
        };
      }
    });
    await openClock(page, "2026-01-15T12:00:00Z");
    const error = page.getByRole("alert");
    await error.waitFor({ state: "visible", timeout: 10_000 });
    expect(await error.innerText()).toMatch(/invalid|error|unsupported|time.?zone/i);
    const fallback = page.locator('[data-timezone="Asia/Kathmandu"] [data-testid="timezone-time"]');
    expect(await fallback.count() === 0 || (await fallback.innerText()) !== "12:00:00").toBe(true);
  } finally { await page.close(); }
});
