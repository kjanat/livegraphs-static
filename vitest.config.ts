/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const _dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    exclude: [
      ...configDefaults.exclude,
      "**/e2e/*",
      "tests-examples/",
      "**/useDatabase.test.ts",
      "**/dataProcessor.integration.test.ts"
    ],
    reporters: process.env.GITHUB_ACTIONS
      ? ["dot", "github-actions"]
      : ["default", "dot", "hanging-process"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "out/",
        "vitest.setup.ts",
        "**/e2e/*",
        " tests-examples/"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
