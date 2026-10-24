import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { formatDateAndTime } from './time';

const TIMEZONES = [
  'UTC',
  'Pacific/Auckland',
  'America/New_York',
  'Asia/Kolkata',
  'Asia/Kathmandu',
];

function ClockRow({ timezone }: { timezone: string }) {
  const [dateTime, setDateTime] = useState<{ date: string; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = formatDateAndTime(now, timezone);
      setDateTime(formatted);
      setError(null);
    } catch (err) {
      setDateTime(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [timezone]);

  if (error) {
    return (
      <div role="alert" data-testid="timezone-clock" data-timezone={timezone} style={{ color: 'red' }}>
        {error}
      </div>
    );
  }

  if (!dateTime) return null;

  return (
    <div data-testid="timezone-clock" data-timezone={timezone} style={{padding: '0.5em', borderBottom: '1px solid #ccc'}}>
      <strong>{timezone}</strong>{' '}
      <span data-testid="timezone-date">{dateTime.date}</span>{' '}
      <span data-testid="timezone-time">{dateTime.time}</span>
    </div>
  );
}

export function App() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let animationFrameId: number | null = null;
    let timeoutId: number | null = null;
    let focused = document.hasFocus();

    function tick() {
      setNow(new Date());
      // Calculate the delay so next tick aligns on the second boundary
      const delay = 1000 - (Date.now() % 1000);
      timeoutId = window.setTimeout(() => {
        animationFrameId = window.requestAnimationFrame(tick);
      }, delay);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    }

    function handleFocus() {
      if (!focused) {
        focused = true;
        setNow(new Date());
      }
    }

    function handleBlur() {
      focused = false;
    }

    tick();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '360px', margin: '2rem auto', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h1 style={{ fontWeight: '900', fontSize: '1.5rem', marginBottom: '1rem' }}>Timezone Explorer</h1>
      {TIMEZONES.map((tz) => {
        let data: { date: string; time: string } | null = null;
        let error: string | null = null;
        try {
          data = formatDateAndTime(now, tz);
          error = null;
        } catch (e) {
          error = e instanceof Error ? e.message : String(e);
        }

        if (error) {
          return (
            <div key={tz} role="alert" data-testid="timezone-clock" data-timezone={tz} style={{ color: 'red', padding: '0.5em', borderBottom: '1px solid #ccc' }}>
              {error}
            </div>
          );
        }

        return (
          <div key={tz} data-testid="timezone-clock" data-timezone={tz} style={{padding: '0.5em', borderBottom: '1px solid #ccc'}}>
            <strong>{tz}</strong>{' '}
            <span data-testid="timezone-date">{data.date}</span>{' '}
            <span data-testid="timezone-time">{data.time}</span>
          </div>
        );
      })}
    </main>
  );
}

// Mount the app on the #root element
const container = document.getElementById('root');
if (!container) throw new Error('#root element not found in document');
const root = createRoot(container);
root.render(<App />);
