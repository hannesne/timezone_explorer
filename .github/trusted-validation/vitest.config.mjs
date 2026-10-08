import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    include: ["timezone.test.mjs"], passWithNoTests: false, watch: false,
    testTimeout: 30_000, hookTimeout: 30_000, fileParallelism: false,
  },
});
