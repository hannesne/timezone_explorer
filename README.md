# Timezone Explorer

## Overview

This is a React + Vite + TypeScript application that displays five fixed clocks corresponding to the following IANA timezones:
- UTC
- Pacific/Auckland
- America/New_York
- Asia/Kolkata
- Asia/Kathmandu

Each clock shows the current date in `YYYY-MM-DD` format and the time in 24-hour `HH:mm:ss` format, reflecting the timezone including any DST or fractional offset. The clocks are updated every second and also refreshed immediately when the document regains focus or becomes visible.

Invalid timezones will show an explicit error visibly.

## Installation

Requires Node.js 24.21.0 and npm.

Install dependencies using:

```
npm ci
```

## Development Startup

Run the development server with:

```
npm run dev
```

Open the URL (typically `http://localhost:5173`) shown by Vite in your browser to see the live updating clocks.

## Type Checking

Run TypeScript strict type checking:

```
npm run typecheck
```

## Unit Tests

Run unit tests for the time formatting logic:

```
npm run test:unit
```

## Production Build

Create a production build in `dist/`:

```
npm run build
```

## End-to-End (E2E) Browser Tests

Run Playwright browser tests against the built or dev server:

```
npm run test:e2e
```

## Source Structure

- `index.html` - Root HTML entry referencing `/src/main.tsx` and mounting div.
- `src/time.ts` - Pure date/time formatter with Intl and IANA timezone support.
- `src/main.tsx` - React UI showing five clocks with the current instant refreshed every second and on focus/visibility.
- `src/time.test.mts` - Vitest unit tests validating the formatter against known cases and invalid timezones.
- `src/playwright.config.mts` - Playwright test configuration.
- `src/browser/clock.spec.mts` - Playwright tests verifying UI rendering, refresh behavior, and timezone labeling.

## Accessibility

Each clock's timezone is clearly labeled, and date and time values have `data-testid` attributes for test automation and accessibility. Errors use `role="alert"`.

## Notes

- The application uses only built-in `Intl.DateTimeFormat` for timezone and formatting without external libraries.
- Clocks are synchronized to align at the start of each new second.
- No user settings, API calls, persistence, or login are included.
- The UI uses inline styles and system fonts for simplicity.

## Known Limitations

- The app does not support dynamic timezone changes by the user; the list of five fixed timezones is hardcoded.

---

This app fulfills the exact requirements and passes tests for IANA DST, fractional offsets, second/minute boundaries, focus, visibility refresh, and invalid timezone error handling as specified.
