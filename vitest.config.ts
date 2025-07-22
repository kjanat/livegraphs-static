import path from "node:path";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    exclude: [...configDefaults.exclude, "**/e2e/*", "tests-examples/", "**/useDatabase.test.ts"],
    coverage: {
      reporter: ["text", "json", "", "html"],
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
