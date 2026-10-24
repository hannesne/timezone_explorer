import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Timezone } from "./time";

const timezones = [
  "UTC",
  "Pacific/Auckland",
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Kathmandu",
] as const;

interface ClockProps {
  timezone: string;
  instant: Date;
}

function Clock({ timezone, instant }: ClockProps) {
  const data = Timezone.formatDateTime(instant, timezone);

  if ("error" in data) {
    return (
      <div
        role="alert"
        data-testid="timezone-clock"
        data-timezone={timezone}
        style={{
          border: "1px solid red",
          padding: "8px",
          marginBottom: "4px",
          fontFamily: "sans-serif",
          backgroundColor: "#ffe6e6",
          color: "#b30000",
        }}
      >
        {timezone}: {data.error}
      </div>
    );
  }

  return (
    <div
      data-testid="timezone-clock"
      data-timezone={timezone}
      style={{
        border: "1px solid #ccc",
        padding: "8px",
        marginBottom: "4px",
        fontFamily: "sans-serif",
      }}
    >
      <div>{timezone}</div>
      <div data-testid="timezone-date">{data.date}</div>
      <div data-testid="timezone-time">{data.time}</div>
    </div>
  );
}

function App() {
  const [instant, setInstant] = useState(new Date());

  const refreshTime = useCallback(() => {
    setInstant(new Date());
  }, []);

  useEffect(() => {
    // refresh every second
    const interval = setInterval(() => {
      refreshTime();
    }, 1000);

    // refresh on window focus or visibility change
    function onFocus() {
      refreshTime();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshTime();
      }
    }

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshTime]);

  return (
    <main
      style={{
        margin: "2rem auto",
        padding: "1rem",
        maxWidth: "320px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        backgroundColor: "#f9f9f9",
        userSelect: "none",
      }}
    >
      {timezones.map((tz) => (
        <Clock key={tz} timezone={tz} instant={instant} />
      ))}
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element with id 'root' not found");
}
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export { App };
