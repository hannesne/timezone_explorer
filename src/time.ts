// src/time.ts
// Provide stable timezone-clock and formatter hooks for date/time display.

// Exported API:
// formatDateAndTime(instant: Date, timezone: string): { date: string; time: string }
// Throws error if timezone is invalid.

export function formatDateAndTime(instant: Date, timezone: string): { date: string; time: string } {
  try {
    // Validate timezone by constructing Intl.DateTimeFormat (will throw if invalid)
    const dtfDate = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      timeZone: timezone,
      calendar: 'gregory',
    });
    const dtfTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZone: timezone,
    });

    // Format the date as YYYY-MM-DD (ISO style): en-CA locale formats ISO style date.
    const date = dtfDate.format(instant); // Format returns YYYY-MM-DD (en-CA)
    const time = dtfTime.format(instant); // HH:mm:ss 24h

    return { date, time };
  } catch (err) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

