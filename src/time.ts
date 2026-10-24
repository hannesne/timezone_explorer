// src/time.ts
// Pure Intl formatter with a stable consistent exported API

export function formatDateTime(timezone: string, date: Date): { date: string; time: string } {
  // Use Intl.DateTimeFormat for accurate timezone formatting
  try {
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZoneName: undefined,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Format returns e.g. 2026-10-24, time 13:45:06
    // We parse the formatted parts to build the string explicitly
    const parts = dateFormatter.formatToParts(date);

    let year = '';
    let month = '';
    let day = '';
    let hour = '';
    let minute = '';
    let second = '';

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

    // Compose strings: YYYY-MM-DD and HH:mm:ss 24h format
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hour}:${minute}:${second}`;

    return { date: formattedDate, time: formattedTime };
  } catch (e) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

