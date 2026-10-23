import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { formatDateTimeInZone, TimeParts } from "./time";

const TIMEZONES = [
  "UTC",
  "Pacific/Auckland",
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Kathmandu",
] as const;

type TimeZone = typeof TIMEZONES[number];

// Custom hook to get current Date refreshed every second and on visibility/focus
function useCurrentDate(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let aniFrameId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Update at the start of each second precisely
    const tick = () => {
      timeoutId = setTimeout(() => {
        setNow(new Date());
        intervalId = setInterval(() => {
          setNow(new Date());
        }, 1000);
      }, 1000 - (Date.now() % 1000));
    };

    tick();

    // Refresh on focus and visibility change
    const onFocusOrVisibility = () => {
      setNow(new Date());
    };

    window.addEventListener("focus", onFocusOrVisibility);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) onFocusOrVisibility();
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("focus", onFocusOrVisibility);
      document.removeEventListener("visibilitychange", () => {
        if (!document.hidden) onFocusOrVisibility();
      });
    };
  }, []);

  return now;
}

function TimezoneClock({ timeZone }: { timeZone: TimeZone }) {
  const now = useCurrentDate();
  const [timeParts, setTimeParts] = useState<TimeParts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parts = formatDateTimeInZone(now, timeZone);
      setTimeParts(parts);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid timezone");
      setTimeParts(null);
    }
  }, [now, timeZone]);

  if (error) {
    return (
      <div data-testid="timezone-clock" data-timezone={timeZone} role="alert" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  if (!timeParts) {
    return (
      <div data-testid="timezone-clock" data-timezone={timeZone} aria-busy="true">
        Loading...
      </div>
    );
  }

  return (
    <div
      data-testid="timezone-clock"
      data-timezone={timeZone}
      style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', fontSize: 16, margin: "0.25rem 0", display: "flex", flexDirection: "row", gap: "1rem" }}
    >
      <div style={{flexBasis: 200, fontWeight: "bold"}}>{timeZone}</div>
      <time
        dateTime={`${timeParts.date}T00:00:00`}
        data-testid="timezone-date"
        style={{ minWidth: 90 }}
      >
        {timeParts.date}
      </time>
      <time
        dateTime={`${timeParts.date}T${timeParts.time}`}
        data-testid="timezone-time"
        style={{ minWidth: 80, fontVariantNumeric: "tabular-nums" }}
      >
        {timeParts.time}
      </time>
    </div>
  );
}

function App() {
  return (
    <main style={{ padding: "1rem", maxWidth: 600, margin: "auto" }}>
      <h1 style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', textAlign: "center" }}>Timezone Explorer</h1>
      {TIMEZONES.map((tz) => (
        <TimezoneClock key={tz} timeZone={tz} />
      ))}
    </main>
  );
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

