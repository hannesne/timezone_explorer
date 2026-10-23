# Timezone Explorer

## Overview
This is a small React + Vite + TypeScript application that displays five clocks for fixed IANA timezones:
- UTC
- Pacific/Auckland
- America/New_York
- Asia/Kolkata
- Asia/Kathmandu

Each clock row shows the full IANA timezone name, the local date as `YYYY-MM-DD` and the local time as 24-hour `HH:mm:ss`. All clocks show the same current instant refreshed every second and on window focus or visibility change. DST and fractional offsets are correctly handled using the Intl API.

Invalid timezones produce a visible accessible error message (role=alert).

## Local Setup

### Requirements
- Node.js v24.21.0 (official LTS recommended)
- npm (version compatible with above Node)

### Installation

Run:

```bash
npm ci
```

This installs dependencies cleanly from the package-lock.json.

## Development

Run a Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173` (default Vite port).

## Type Checking

Run TypeScript compiler checks:

```bash
npm run typecheck
```

No code is emitted; type errors will be reported.

## Unit Tests

Run the Vitest unit tests on the time formatting utilities:

```bash
npm run test:unit
```

This verifies correct time formatting for all five timezones and error handling.

## Production Build

Build a production bundle:

```bash
npm run build
```

Output goes to `dist/` by default.

## End-to-End Tests

Run Playwright browser tests:

```bash
npm run test:e2e
```

These tests verify the UI clocks render correctly, update every second, and refresh on focus and visibility changes.

## Implementation Details

- Timezone formatting and validation are encapsulated in `src/time.ts`.
- The main React app `src/main.tsx` renders the clocks with inline styles and handles periodic updates.
- Tests are split into unit tests (`src/time.test.ts`) and browser tests (`src/browser/clock.spec.ts`).
- No external pickers, persistence, or APIs are used.
- Accessibility considerations include clear labelling and error alerts.

## License
MIT (Please confirm licensing).
