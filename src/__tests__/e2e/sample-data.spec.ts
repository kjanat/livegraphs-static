import { expect, test } from "@playwright/test";

test.describe("Notso AI Dashboard - Sample Data", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for database to initialize
    await page.waitForSelector('button:has-text("Try Sample Data")', { timeout: 10000 });
  });

  test("can load sample data", async ({ page }) => {
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Check that data management UI appears
    await expect(page.getByText("Manage Data")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear Database" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();
  });

  test("shows database statistics after loading sample data", async ({ page }) => {
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for data to load
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    // Check statistics are visible
    await expect(page.getByText("Database Statistics")).toBeVisible();
    await expect(page.getByText("Total Sessions")).toBeVisible();
    await expect(page.getByText(/\d+/).first()).toBeVisible(); // Session count
  });

  test("shows date range controls after loading sample data", async ({ page }) => {
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for data to load
    await page.waitForSelector("text=Date Range", { timeout: 10000 });

    // Check date range controls
    await expect(page.getByText("Date Range")).toBeVisible();
    await expect(page.getByRole("button", { name: "Last Week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Last Month" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All Data" })).toBeVisible();
  });

  test("can clear database after loading sample data", async ({ page }) => {
    // Load sample data first
    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    // Set up dialog handler
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Are you sure");
      await dialog.accept();
    });

    // Clear database
    await page.getByRole("button", { name: "Clear Database" }).click();

    // Should return to initial state
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible({
      timeout: 10000
    });
    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("can export CSV after loading sample data", async ({ page }) => {
    // Load sample data first
    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    // Set up download handler
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;

    // Check download filename
    expect(download.suggestedFilename()).toMatch(/chatbot_sessions.*\.csv$/);
  });
});
