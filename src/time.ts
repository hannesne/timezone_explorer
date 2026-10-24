// src/time.ts

export namespace Timezone {
  export function formatDateTime(instant: Date, timeZone: string): { date: string; time: string } | { error: string } {
    try {
      // Verify if the timezone is valid by trying to create a DateTimeFormat
      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // The date format is YYYY-MM-DD
      const partsDate = dateFormatter.formatToParts(instant);
      const year = partsDate.find(p => p.type === 'year')?.value ?? '';
      const month = partsDate.find(p => p.type === 'month')?.value ?? '';
      const day = partsDate.find(p => p.type === 'day')?.value ?? '';
      if (!year || !month || !day) {
        return { error: `Invalid date format for timezone ${timeZone}` };
      }
      const date = `${year}-${month}-${day}`;

      // The time format is 24-hour HH:mm:ss
      const time = timeFormatter.format(instant);
      if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
        return { error: `Invalid time format for timezone ${timeZone}` };
      }

      return { date, time };
    } catch (e) {
      return { error: `Invalid timezone ${timeZone}` };
    }
  }
}

export default Timezone;
