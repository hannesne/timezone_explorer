import { expect } from "@playwright/test";

export const ZONES = ["UTC", "Pacific/Auckland", "America/New_York", "Asia/Kolkata", "Asia/Kathmandu"];
export const WINTER = [
  ["UTC", "2026-01-15", "12:00:00"],
  ["Pacific/Auckland", "2026-01-16", "01:00:00"],
  ["America/New_York", "2026-01-15", "07:00:00"],
  ["Asia/Kolkata", "2026-01-15", "17:30:00"],
  ["Asia/Kathmandu", "2026-01-15", "17:45:00"],
];

export async function openClock(page, instant) {
  await page.clock.install({ time: new Date(instant) });
  await page.clock.pauseAt(new Date(instant));
  await page.goto(process.env.ACCEPTANCE_URL, { waitUntil: "networkidle" });
}

export async function assertRow(page, zone, date, time) {
  const row = page.locator(`[data-testid="timezone-clock"][data-timezone="${zone}"]`);
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(zone);
  await expect(row.getByTestId("timezone-date")).toHaveText(date);
  await expect(row.getByTestId("timezone-time")).toHaveText(time);
}

export async function assertWinter(page, seconds = "00") {
  await expect(page.getByTestId("timezone-clock")).toHaveCount(5);
  for (const [zone, date, time] of WINTER) await assertRow(page, zone, date, time.slice(0, -2) + seconds);
}

export async function assertInstant(page, instant) {
  await expect(page.getByTestId("timezone-clock")).toHaveCount(5);
  for (const zone of ZONES) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const value = type => parts.find(part => part.type === type).value;
    await assertRow(page, zone, `${value("year")}-${value("month")}-${value("day")}`,
      `${value("hour")}:${value("minute")}:${value("second")}`);
  }
}
