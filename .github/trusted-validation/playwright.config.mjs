import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: fileURLToPath(new URL(".", import.meta.url)), testMatch: "browser.spec.mjs",
  outputDir: process.env.PROOF_DIRECTORY + "/browser",
  retries: 0, workers: 1, forbidOnly: true, timeout: 30_000,
  use: { browserName: "chromium", trace: "on", screenshot: "on" },
});
