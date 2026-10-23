// src/time.ts

// Provides stable timezone date-time formatting using Intl.DateTimeFormat
// with options returning formatted YYYY-MM-DD and HH:mm:ss (24h) strings.

// Exports an interface TimeParts: date and time strings
// Export function formatDateTimeInZone(now: Date, timeZone: string): TimeParts
// Throws an explicit Error if the timezone is invalid or not supported

export interface TimeParts {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss 24h format
}

// Validate if a timezone string is a valid IANA zone recognized by Intl
function isValidTimeZone(zone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export function formatDateTimeInZone(now: Date, timeZone: string): TimeParts {
  if (!isValidTimeZone(timeZone)) {
    throw new Error(`Invalid timezone identifier: ${timeZone}`);
  }

  // Create Intl.DateTimeFormat for the zone
  // date Y-M-D in ISO format
  // time HH:mm:ss with 24-hour clock

  // To reliably get the YYYY-MM-DD, use dateStyle "short" could be locale affected,
  // better build by parts from Intl.DateTimeFormat formatToParts()

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // format date to parts for guaranteed YYYY-MM-DD
  const dateParts = dateFormatter.formatToParts(now);

  // Extract year, month, day parts
  // Ordinarily found in parts type "year", "month", "day"
  let year = "";
  let month = "";
  let day = "";

  for (const part of dateParts) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
  }

  const date = `${year}-${month}-${day}`;
  const time = timeFormatter.format(now);

  return { date, time };
}

