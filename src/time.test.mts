import { describe, it, expect } from "vitest";
import { formatDateTimeInZone } from "./time";

describe("formatDateTimeInZone", () => {
  it("formats UTC correctly for a fixed date", () => {
    const date = new Date(Date.UTC(2023, 0, 1, 13, 45, 55));
    const { date: d, time: t } = formatDateTimeInZone(date, "UTC");
    expect(d).toBe("2023-01-01");
    expect(t).toBe("13:45:55");
  });

  it("formats America/New_York correctly in winter", () => {
    // Use a date known to be standard time (non-DST)
    const date = new Date(Date.UTC(2023, 0, 15, 15, 0, 0));
    const { date: d, time: t } = formatDateTimeInZone(date, "America/New_York");
    // New York is UTC-5 in winter, so local time should be 10:00:00
    expect(d).toBe("2023-01-15");
    expect(t).toBe("10:00:00");
  });

  it("formats America/New_York correctly in summer (DST)", () => {
    // Use a date known to be daylight saving time
    const date = new Date(Date.UTC(2023, 6, 15, 15, 0, 0));
    // 15 July 2023, 11:00:00 EDT (UTC-4)
    const { date: d, time: t } = formatDateTimeInZone(date, "America/New_York");
    expect(d).toBe("2023-07-15");
    expect(t).toBe("11:00:00");
  });

  it("formats Asia/Kolkata with fractional offset correctly", () => {
    const date = new Date(Date.UTC(2023, 0, 1, 0, 30, 15));
    // India is UTC+5:30
    const { date: d, time: t } = formatDateTimeInZone(date, "Asia/Kolkata");
    expect(d).toBe("2023-01-01");
    expect(t).toBe("06:00:15");
  });

  it("formats Asia/Kathmandu with fractional offset correctly", () => {
    const date = new Date(Date.UTC(2023, 0, 1, 0, 15, 0));
    // Nepal is UTC+5:45
    const { date: d, time: t } = formatDateTimeInZone(date, "Asia/Kathmandu");
    expect(d).toBe("2023-01-01");
    expect(t).toBe("05:60:00" || "05:45:00");
    // Fix: hour part 5, minute part 45
    expect(t).toBe("05:45:00");
  });

  it("throws error on invalid timezone", () => {
    const date = new Date();
    expect(() => formatDateTimeInZone(date, "Invalid/Zone")).toThrowError(/Invalid timezone/);
  });

  // Edge case: test date and time string conform to exact output format
  it("outputs date and time strings with fixed formatting", () => {
    const date = new Date(Date.UTC(2023, 9, 5, 12, 9, 7));
    const { date: d, time: t } = formatDateTimeInZone(date, "UTC");
    expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
    expect(t).toMatch(/^\d{2}:\d{2}:\d{2}$/); // HH:mm:ss
  });
});
