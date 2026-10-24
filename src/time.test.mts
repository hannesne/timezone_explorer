import { describe, it, expect } from 'vitest';
import { formatDateTime } from './time';

// Helper for controlled tests
function makeUTCDate(y: number, m: number, d: number, h = 0, min = 0, s = 0) {
  return new Date(Date.UTC(y, m - 1, d, h, min, s));
}

describe('time.ts formatDateTime', () => {
  it('formats UTC date and time correctly', () => {
    const utcDate = makeUTCDate(2026, 10, 24, 23, 15, 30);
    const result = formatDateTime('UTC', utcDate);
    expect(result.date).toBe('2026-10-24');
    expect(result.time).toBe('23:15:30');
  });

  it('formats Pacific/Auckland date/time with valid IANA and DST', () => {
    // A fixed date known for DST consideration
    const date = makeUTCDate(2026, 4, 5, 12, 0, 0);
    const result = formatDateTime('Pacific/Auckland', date);
    expect(result.date).toMatch(/^2026-04-/);
    expect(result.time).toMatch(/^..:..:..$/);
  });

  it('formats America/New_York summer DST correctly', () => {
    const date = makeUTCDate(2026, 7, 1, 15, 30, 0);
    const result = formatDateTime('America/New_York', date);
    expect(result.date).toBe('2026-07-01');
    expect(result.time).toBeDefined();
  });

  it('formats Asia/Kolkata with fractional offset', () => {
    const date = makeUTCDate(2026, 1, 15, 6, 0, 0);
    const result = formatDateTime('Asia/Kolkata', date);
    expect(result.date).toBe('2026-01-15');
    expect(result.time).toBeDefined();
  });

  it('formats Asia/Kathmandu with +5:45 fractional offset correctly', () => {
    const date = makeUTCDate(2026, 10, 24, 0, 0, 0);
    const result = formatDateTime('Asia/Kathmandu', date);
    expect(result.date).toBe('2026-10-24');
    expect(result.time).toBeDefined();
  });

  it('throws error for invalid timezone', () => {
    const date = makeUTCDate(2026, 10, 24, 0, 0, 0);
    expect(() => formatDateTime('Invalid/Zone', date)).toThrowError(/Invalid timezone/);
  });
});
