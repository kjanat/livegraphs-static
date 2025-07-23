import * as path from "node:path";
import { expect, test } from "@playwright/test";

test.describe("Notso AI Dashboard", () => {
  // Skip mobile browsers for these desktop-focused tests
  test.skip(({ isMobile }) => isMobile === true, "Desktop only tests");
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title and metadata", async ({ page }) => {
    await expect(page).toHaveTitle("Notso AI - Chatbot Analytics Dashboard");

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toContain("chatbot conversation");
  });

  test("displays initial UI elements", async ({ page }) => {
    // Wait for UI to load
    await page.waitForSelector('h1:has-text("Notso AI Dashboard")', { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Notso AI Dashboard" })).toBeVisible();
    await expect(page.getByText("Upload JSON File")).toBeVisible();
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("can upload a JSON file and display data", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Upload JSON File").click();
    const fileChooser = await fileChooserPromise;

    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileChooser.setFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // Dashboard should appear immediately without reload
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).not.toBeVisible();
    // Use a more specific selector to avoid strict mode violations
    await expect(page.getByText("Total Sessions").first()).toBeVisible();
    await expect(page.getByText("Avg. User Rating")).toBeVisible();
  });

  test("displays UI after database initialization", async ({ page }) => {
    // Wait for database to initialize and UI to load
    await page.waitForSelector("text=Upload JSON File", { timeout: 10000 });
    // After initialization, the upload UI should be visible
    await expect(page.getByText("Upload JSON File")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("mobile responsive design", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for UI to load in mobile view
    await page.waitForSelector('h1:has-text("Notso AI Dashboard")', { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Notso AI Dashboard" })).toBeVisible();
    // The upload UI should be present but might be rendered differently on mobile
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible();

    // On mobile, we need to expand the upload section first
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("dashboard appears after sample data load", async ({ page }) => {
    // Click Try Sample Data button
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // Wait a moment for UI to update
    await page.waitForTimeout(1000);

    // Check if dashboard elements are visible
    const dateRangeVisible = await page
      .getByRole("heading", { name: "Date Range" })
      .isVisible()
      .catch(() => false);
    const dbStatsVisible = await page
      .getByText(/sessions in database/)
      .isVisible()
      .catch(() => false);

    expect(dateRangeVisible || dbStatsVisible).toBe(true);
  });

  test("date range picker appears after data upload", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Upload JSON File").click();
    const fileChooser = await fileChooserPromise;

    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileChooser.setFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // After data is loaded, the dashboard should appear immediately without reload
    // Wait for the dashboard elements to appear
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    // Now the Date Range picker should be visible
    await expect(page.getByText("Date Range").first()).toBeVisible();
  });

  test("can clear database", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Upload JSON File").click();
    const fileChooser = await fileChooserPromise;

    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileChooser.setFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Clear all data from database" })).toBeVisible();

    // Click the clear button which will show a confirmation dialog
    await page.getByRole("button", { name: "Clear all data from database" }).click();

    // Wait for and click the confirmation button in the dialog
    await page.waitForSelector("text=Clear All Data?", { timeout: 5000 });
    await page.getByRole("button", { name: "Clear Database", exact: true }).click();

    // Wait for the empty state to appear
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible();
  });

  test("displays various chart types", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Upload JSON File").click();
    const fileChooser = await fileChooserPromise;

    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileChooser.setFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("canvas").first()).toBeVisible();
    await expect(page.getByText("Conversation Duration Distribution")).toBeVisible();
    await expect(page.getByText("Weekly Usage Heatmap")).toBeVisible();
    await expect(page.getByText("Performance Trends Over Time")).toBeVisible();
  });

  test("export data functionality", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Upload JSON File").click();
    const fileChooser = await fileChooserPromise;

    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileChooser.setFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export data as CSV file" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".csv");
  });
});
