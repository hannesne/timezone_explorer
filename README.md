# Timezone Explorer

This project is a Timezone Explorer built with React, TypeScript, and Vite. It displays five fixed clocks with accurate date and time for different IANA time zones, refreshing every second and on window focus/visibility changes.

## Features

- Five fixed timezone clocks: UTC, Pacific/Auckland, America/New_York, Asia/Kolkata, Asia/Kathmandu.
- Shows current date (YYYY-MM-DD) and 24-hour time (HH:mm:ss) precisely from a single instant.
- Respects IANA timezone rules including DST and fractional offsets.
- Refreshes every second and immediately on window focus and visibility.
- Accessible and readable inline CSS layout.
- Explicit error display for invalid timezones.

## Setup and Development

### Prerequisites
- Node.js 24.x
- npm 11.x

### Install

Run a clean install of dependencies:

```
npm ci
```

### Development

Run the development server with Vite:

```
npm run dev
```

Open your browser at `http://localhost:5173` (or as indicated by Vite).

### Type Checking

Run TypeScript type checking:

```
npm run typecheck
```

### Unit Tests

Run unit tests with Vitest:

```
npm run test:unit
```

### Production Build

Build the optimized production bundle:

```
npm run build
```

### End-to-End Tests

Run Playwright browser tests:

```
npm run test:e2e
```

## File Structure
- `index.html`: Application entry HTML.
- `src/main.tsx`: React main application and mounting logic.
- `src/time.ts`: Timezone date-time formatting with stable consistent API.
- `src/time.test.mts`: Unit tests for time formatting.
- `src/playwright.config.mts`: Playwright test configuration.
- `src/browser/clock.spec.mts`: Browser/Playwright tests for UI clocks.
- `package.json`: Scripts and dependency declarations.

## Notes
- The clocks use one actual single timestamp refreshed every second and on focus/visibility.
- The app strictly uses native Intl for timezone handling and validates timezone identifiers.
- No timezone picker or settings; timezone list fixed as per requirements.

This project requires independent CI for verification and testing as no local runs were conducted during source generation.
