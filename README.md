# Timezone Explorer

This is a Vite + React + TypeScript application to display an explorer for five fixed timezones:

- UTC
- Pacific/Auckland
- America/New_York
- Asia/Kolkata
- Asia/Kathmandu

Features:

- Shows the current date (YYYY-MM-DD) and 24-hour time (HH:mm:ss) for each timezone
- Refreshes every second and updates immediately on window focus or visibility change
- Uses IANA timezone database with DST and fractional offsets awareness
- Reports timezone errors visibly
- Accessible layout with stable timezone hooks

## Node and Package Manager

- Node.js version: 24.21.0
- Package manager: npm

## Installation

Run `npm ci` to clean install dependencies based on the locked package-lock.json.

## Development

Run `npm run dev` to start the development server with hot reload.

## Type Checking

Run `npm run typecheck` to perform a strict TypeScript check without emitting any files.

## Unit Testing

Run `npm run test:unit` to run the Vitest tests for timezone formatting.

## Production Build

Run `npm run build` to produce a production-optimized build with Vite.

## End-to-End Browser Testing

Run `npm run test:e2e` to perform Playwright tests for the timezone clocks UI.

## File Structure

- `index.html` - HTML entry point mounting React app
- `src/time.ts` - Pure timezone formatting utilities
- `src/main.tsx` - React UI app rendering five clocks
- `src/time.test.mts` - Vitest unit tests for timezone formatting
- `src/playwright.config.mts` - Playwright configuration
- `src/browser/clock.spec.mts` - Playwright UI tests for the clock component

No external settings, persistence, login, or API calls are included.

-- End of README --
