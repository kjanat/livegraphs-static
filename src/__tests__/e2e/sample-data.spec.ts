import { expect, test } from "@playwright/test";

test.describe("Notso AI Dashboard - Sample Data", () => {
  // Skip mobile browsers for these desktop-focused tests
  test.skip(({ isMobile }) => isMobile === true, "Desktop only tests");
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

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that data management UI appears
    await expect(page.getByText("Manage Data")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear all data from database" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export data as CSV file" })).toBeVisible();
  });

  test("shows database statistics after loading sample data", async ({ page }) => {
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check statistics are visible
    await expect(page.getByText("Data Statistics")).toBeVisible();
    await expect(page.getByText("Total Sessions")).toBeVisible();
    await expect(page.getByText(/\d+/).first()).toBeVisible(); // Session count
  });

  test("shows date range controls after loading sample data", async ({ page }) => {
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check date range controls
    await expect(page.getByText("Date Range")).toBeVisible();
    await expect(page.getByRole("button", { name: "Last Week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Last Month" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All Data", exact: true })).toBeVisible();
  });

  test("can clear database after loading sample data", async ({ page }) => {
    // Load sample data first
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Clear database
    // Click the clear button which will show a confirmation dialog
    await page.getByRole("button", { name: "Clear all data from database" }).click();

    // Wait for and click the confirmation button in the dialog
    await page.waitForSelector("text=Clear All Data?", { timeout: 5000 });
    await page.getByRole("button", { name: "Clear Database", exact: true }).click();

    // Should return to initial state
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible({
      timeout: 10000
    });
    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("can export CSV after loading sample data", async ({ page }) => {
    // Load sample data first
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Set up download handler
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export data as CSV file" }).click();
    const download = await downloadPromise;

    // Check download filename
    expect(download.suggestedFilename()).toMatch(/livegraphs.*\.csv$/);
  });
});
