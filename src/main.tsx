import React, { useEffect, useState, useCallback } from 'react';
import { formatZonedDateTime, ZonedDateTime } from './time';

const TIMEZONES = [
  'UTC',
  'Pacific/Auckland',
  'America/New_York',
  'Asia/Kolkata',
  'Asia/Kathmandu'
];

interface ClockProps {
  timezone: string;
  instant: Date;
}

function Clock({ timezone, instant }: ClockProps) {
  const [dateTime, setDateTime] = useState<ZonedDateTime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dt = formatZonedDateTime(timezone, instant);
      setDateTime(dt);
      setError(null);
    } catch (e) {
      setDateTime(null);
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      setError(errMsg);
    }
  }, [timezone, instant]);

  if (error) {
    return (
      <div data-testid="timezone-clock" data-timezone={timezone} role="alert" style={{
        border: '1px solid red',
        padding: '0.5rem 1rem',
        margin: '0.3rem 0',
        color: 'darkred',
        backgroundColor: '#ffe6e6',
        fontFamily: 'monospace',
      }}>
        {error}
      </div>
    );
  }

  if (!dateTime) {
    return (
      <div data-testid="timezone-clock" data-timezone={timezone} style={{
        padding: '0.5rem 1rem',
        margin: '0.3rem 0',
        fontFamily: 'monospace',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div data-testid="timezone-clock" data-timezone={timezone} style={{
      padding: '0.5rem 1rem',
      margin: '0.3rem 0',
      fontFamily: 'monospace',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
    }}>
      <span aria-label={`Timezone name`} style={{ flex: '1' }}>
        {timezone}
      </span>
      <span data-testid="timezone-date" aria-label={`Local date`} style={{ width: '100px', textAlign: 'right' }}>
        {dateTime.date}
      </span>
      <span data-testid="timezone-time" aria-label={`Local time`} style={{ width: '80px', textAlign: 'right', marginLeft: '1rem' }}>
        {dateTime.time}
      </span>
    </div>
  );
}

export default function App() {
  // Store instant in state, updated every second and on focus/visibility
  const [currentInstant, setCurrentInstant] = useState(new Date());

  // Callback to update time
  const updateTime = useCallback(() => {
    setCurrentInstant(new Date());
  }, []);

  useEffect(() => {
    // Interval every second
    const interval = setInterval(updateTime, 1000);

    // Event handlers to update on focus and visibility change
    const onFocus = () => {
      updateTime();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTime();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [updateTime]);

  return (
    <main style={{
      maxWidth: '400px',
      margin: '2rem auto',
      fontFamily: 'Arial, sans-serif',
      fontSize: '1.25rem',
      lineHeight: 1.4,
      padding: '0 1rem'
    }}>
      {TIMEZONES.map(tz => (
        <Clock key={tz} timezone={tz} instant={currentInstant} />
      ))}
    </main>
  );
}
