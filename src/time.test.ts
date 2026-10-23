import { describe, it, expect } from 'vitest';
import { formatZonedDateTime } from './time';

describe('formatZonedDateTime', () => {
  it('formats date and time correctly for UTC', () => {
    const date = new Date('2022-01-15T12:34:56Z');
    const { date: d, time: t } = formatZonedDateTime('UTC', date);
    expect(d).toBe('2022-01-15');
    expect(t).toBe('12:34:56');
  });

  it('formats date and time correctly for America/New_York winter (standard time)', () => {
    // Jan 15 2022 15:00 UTC = 10:00 EST
    const date = new Date('2022-01-15T15:00:00Z');
    const { date: d, time: t } = formatZonedDateTime('America/New_York', date);
    expect(d).toBe('2022-01-15');
    expect(t).toBe('10:00:00');
  });

  it('formats date and time correctly for America/New_York summer (DST)', () => {
    // Jul 15 2022 15:00 UTC = 11:00 EDT DST
    const date = new Date('2022-07-15T15:00:00Z');
    const { date: d, time: t } = formatZonedDateTime('America/New_York', date);
    expect(d).toBe('2022-07-15');
    expect(t).toBe('11:00:00');
  });

  it('formats date and time correctly for Asia/Kolkata (no DST, fractional offset)', () => {
    // Nov 15 2022 18:30 UTC = 00:00 next day India time
    const date = new Date('2022-11-15T18:30:00Z');
    const { date: d, time: t } = formatZonedDateTime('Asia/Kolkata', date);
    expect(d).toBe('2022-11-16');
    expect(t).toBe('00:00:00');
  });

  it('formats date and time correctly for Asia/Kathmandu (no DST, fractional offset +05:45)', () => {
    // Nov 15 2022 18:15 UTC = 00:00 next day Kathmandu time
    const date = new Date('2022-11-15T18:15:00Z');
    const { date: d, time: t } = formatZonedDateTime('Asia/Kathmandu', date);
    expect(d).toBe('2022-11-16');
    expect(t).toBe('00:00:00');
  });

  it('throws error for invalid timezone', () => {
    const date = new Date();
    expect(() => formatZonedDateTime('Invalid/Zone', date)).toThrow('Invalid timezone: Invalid/Zone');
  });

  it('uses provided instant or defaults to current Date', () => {
    const date = new Date('2022-01-01T00:00:00Z');
    const res1 = formatZonedDateTime('UTC', date);
    expect(res1.date).toBe('2022-01-01');
    // We cannot check current real time, but no error or crash expected
    expect(() => formatZonedDateTime('UTC')).not.toThrow();
  });
});
