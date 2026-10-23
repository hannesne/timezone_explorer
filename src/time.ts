// src/time.ts

export interface ZonedDateTime {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss 24-hour
}

/**
 * Returns the current date and time formatted for the given IANA timezone.
 * Throws an Error if the timezone is invalid.
 * Uses Intl.DateTimeFormat with options to get ISO-like date and 24h time.
 */
export function formatZonedDateTime(timezone: string, instant?: Date): ZonedDateTime {
  // Validate and create Intl.DateTimeFormat for the timezone
  let dtf: Intl.DateTimeFormat;
  try {
    dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (e) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  const dateObj = instant ?? new Date();

  // Format the parts we need
  const parts = dtf.formatToParts(dateObj);

  // Collect parts into date and time strings
  let year = '', month = '', day = '', hour = '', minute = '', second = '';

  for (const part of parts) {
    switch (part.type) {
      case 'year':
        year = part.value;
        break;
      case 'month':
        month = part.value;
        break;
      case 'day':
        day = part.value;
        break;
      case 'hour':
        hour = part.value;
        break;
      case 'minute':
        minute = part.value;
        break;
      case 'second':
        second = part.value;
        break;
    }
  }

  const date = `${year}-${month}-${day}`;
  const time = `${hour}:${minute}:${second}`;

  return { date, time };
}
