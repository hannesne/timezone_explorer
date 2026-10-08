import { test } from "@playwright/test";
import { assertInstant, assertWinter, openClock } from "./browser-helpers.mjs";

test("five labelled date/time rows and screenshot", async ({ page }) => {
  await openClock(page, "2026-01-15T12:00:00Z");
  await assertWinter(page);
  await page.screenshot({ path: process.env.PROOF_DIRECTORY + "/candidate.png", fullPage: true });
});
test("actual second and minute boundaries", async ({ page }) => {
  await openClock(page, "2026-01-15T12:00:59Z");
  await page.clock.runFor(1000);
  await assertInstant(page, "2026-01-15T12:01:00Z");
});
test("focus refresh uses the real instant, not counted ticks", async ({ page }) => {
  await openClock(page, "2026-01-15T12:00:00Z");
  await page.clock.setSystemTime(new Date("2026-01-15T12:20:00Z"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await assertInstant(page, "2026-01-15T12:20:00Z");
});
test("visibility return refreshes after a suspended timer", async ({ page }) => {
  await openClock(page, "2026-01-15T12:00:00Z");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.setSystemTime(new Date("2026-01-16T00:00:00Z"));
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await assertInstant(page, "2026-01-16T00:00:00Z");
});
