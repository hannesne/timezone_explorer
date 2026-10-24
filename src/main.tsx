import React, { useEffect, useState, useCallback } from "react";
import { formatDateTime } from "./time";

const TIMEZONES = [
  "UTC",
  "Pacific/Auckland",
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Kathmandu",
];

function useCurrentInstant() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    let active = true;

    const refresh = () => {
      if (!active) return;
      setNow(new Date());
      // Calculate next aligned 1000ms boundary timeout
      const nowMs = Date.now();
      const delay = 1000 - (nowMs % 1000);
      timerId = setTimeout(refresh, delay);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
      }
    };

    const onFocus = () => setNow(new Date());

    refresh();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return now;
}

function ClockRow({ timezone }: { timezone: string }) {
  const now = useCurrentInstant();
  const [error, setError] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    try {
      const { date, time } = formatDateTime(timezone, now);
      setDateStr(date);
      setTimeStr(time);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [timezone, now]);

  if (error) {
    return (
      <div role="alert" data-testid={`timezone-clock`} data-timezone={timezone} style={{
        border: "1px solid red",
        color: "red",
        padding: "0.5em",
        marginBottom: "0.5em"
      }}>
        {error}
      </div>
    );
  }

  return (
    <div
      data-testid="timezone-clock"
      data-timezone={timezone}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #ccc",
        padding: "0.5em",
        marginBottom: "0.5em",
        fontFamily: "system-ui, sans-serif",
        fontSize: "1rem",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div style={{ flexBasis: "30%", fontWeight: "bold" }}>{timezone}</div>
      <div style={{ flexBasis: "35%" }} data-testid="timezone-date">
        {dateStr}
      </div>
      <div style={{ flexBasis: "35%", fontVariantNumeric: "tabular-nums" }} data-testid="timezone-time">
        {timeStr}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main
      style={{
        maxWidth: 480,
        margin: "auto",
        padding: 8,
        userSelect: "none",
      }}
    >
      <h1 style={{ textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        Timezone Explorer
      </h1>
      {TIMEZONES.map((zone) => (
        <ClockRow key={zone} timezone={zone} />
      ))}
    </main>
  );
}
