/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
import { defineConfig, devices, type ReporterDescription } from "@playwright/test";

const CI = !!process.env.CI;
const SHARD_TOTAL = Number(process.env.SHARD_TOTAL || 0);
const SHARD_INDEX = Number(process.env.SHARD_INDEX || 0);

const maybeReporters = [
  ["list"] as ReporterDescription,
  CI && (["junit", { outputFile: "test-results/junit.xml" }] as ReporterDescription),
  CI && (["html", { open: "never", outputFolder: "html-report" }] as ReporterDescription)
];

function defined<T>(v: T | false | undefined | null): v is T {
  return !!v;
}

const REPORTERS = maybeReporters.filter(defined);

export default defineConfig({
  // ---- Collection & timeouts ----
  testDir: "./src/__tests__/e2e",
  timeout: 30_000, // per-test
  expect: { timeout: 5_000 }, // per-expect

  // ---- Parallelism & retries ----
  fullyParallel: true,
  workers: CI ? 2 : undefined, // tune per CI cores
  retries: CI ? 2 : 0,
  forbidOnly: CI,
  maxFailures: CI ? 5 : undefined,

  // ---- Sharding across CI jobs (optional) ----
  shard: SHARD_TOTAL ? { total: SHARD_TOTAL, current: SHARD_INDEX } : undefined,

  // ---- Snapshots ----
  // For classic toMatchSnapshot(): drop them under ./__snapshots__/<file>-snapshots
  snapshotDir: "__snapshots__",
  // For visual/ARIA/etc. snapshots: full control with a template
  snapshotPathTemplate: "{testDir}/__screenshots__{/projectName}/{testFilePath}/{arg}{ext}",

  // ---- Reporters ----
  reporter: REPORTERS,

  // ---- Defaults for all tests ----
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000
    // storageState: './.auth/admin.json', // uncomment if you pre-auth
  },

  // ---- Browsers / projects ----
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] }
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] }
    },

    /* Test against branded browsers. */
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" }
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    }
  ],

  // ---- Dev server ----
  webServer: {
    command: CI ? "pnpm dlx serve -s out -l 3000" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !CI,
    timeout: 120_000
  }
});
