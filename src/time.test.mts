import { describe, it, expect } from 'vitest';
import { formatDateAndTime } from './time';

// For testing fixed instants, use a known date in UTC
const testInstant = new Date('2026-01-15T12:34:56Z'); // UTC fixed date

const EXPECTED = {
  'UTC': { date: '2026-01-15', time: '12:34:56' },
  'Pacific/Auckland': { date: '2026-01-16', time: '01:34:56' }, // NZDT(DST)
  'America/New_York': { date: '2026-01-15', time: '07:34:56' }, // EST no DST in Jan
  'Asia/Kolkata': { date: '2026-01-15', time: '18:04:56' }, // UTC+5:30
  'Asia/Kathmandu': { date: '2026-01-15', time: '18:19:56' }, // UTC+5:45
};

describe('formatDateAndTime standard zones', () => {
  it('formats date and time correctly for each IANA zone', () => {
    for (const [tz, expected] of Object.entries(EXPECTED)) {
      const result = formatDateAndTime(testInstant, tz);
      expect(result.date).toBe(expected.date);
      expect(result.time).toBe(expected.time);
    }
  });
});

describe('formatDateAndTime invalid zone', () => {
  it('throws for invalid timezone', () => {
    expect(() => formatDateAndTime(testInstant, 'Invalid/Timezone')).toThrow(/Invalid timezone/);
  });
});

