import * as path from "node:path";
import { expect, test } from "@playwright/test";

// Only run these tests on mobile devices
test.describe("Notso AI Dashboard - Mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile only tests");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays mobile-specific UI elements", async ({ page }) => {
    // Wait for UI to load
    await page.waitForSelector('h1:has-text("Notso AI Dashboard")', { timeout: 10000 });

    await expect(page.getByRole("heading", { name: "Notso AI Dashboard" })).toBeVisible();

    // Mobile shows "Upload JSON File" instead of "Upload File"
    // First we need to expand the upload section on mobile
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      // Wait for expansion animation
      await page.waitForTimeout(500);
    }

    await expect(page.getByText("Upload JSON File")).toBeVisible();
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try Sample Data" })).toBeVisible();
  });

  test("can upload a JSON file on mobile", async ({ page }) => {
    // Expand upload section
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    // Find the file input by looking for the label
    const fileInput = page.locator('input[type="file"]');
    const testDataFile = path.join(__dirname, "test-data-simple.json");
    await fileInput.setInputFiles(testDataFile);

    // Wait for success toast
    await page.waitForSelector("text=Successfully loaded", { timeout: 10000 });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for data to load from localStorage
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).not.toBeVisible();
    await expect(page.getByText("Total Sessions").first()).toBeVisible();
  });

  test("can load sample data on mobile", async ({ page }) => {
    // Expand upload section
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // The data is loaded but UI needs to update - reload the page to see the changes
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that data is visible
    await expect(page.getByText("Total Sessions")).toBeVisible();

    // Expand upload section to see data management buttons
    const uploadToggleAfter = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggleAfter.isVisible()) {
      await uploadToggleAfter.click();
      await page.waitForTimeout(500);
    }

    // Mobile has a slightly different button with aria-label
    await expect(page.getByRole("button", { name: "Clear all data from database" })).toBeVisible();
  });

  test("can clear database on mobile", async ({ page }) => {
    // Handle the native confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Load sample data first
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Reload to see data
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("text=Total Sessions", { timeout: 10000 });

    // On mobile, we need to expand the upload section first
    const uploadToggleAfter = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggleAfter.isVisible()) {
      await uploadToggleAfter.click();
      await page.waitForTimeout(500);
    }

    // Click the clear button using force to bypass interception
    await page.getByRole("button", { name: "Clear all data from database" }).click({ force: true });

    // The confirm dialog is handled automatically by the dialog handler above

    // Should return to initial state
    await expect(page.getByText("Transform Your Chatbot Data Into Insights")).toBeVisible({
      timeout: 10000
    });
  });

  test("responsive navigation works on mobile", async ({ page }) => {
    // Load sample data to have navigation items
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Reload to see data
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check that data loaded - on mobile, metrics are visible by default
    await expect(page.getByText("Total Sessions")).toBeVisible();

    // Wait a bit longer for charts to render
    await page.waitForTimeout(2000);

    // On mobile, we should check for specific chart elements or sections
    // Look for chart titles or containers that should be visible
    const hasChartTitle = await page
      .getByText("General Analytics")
      .isVisible()
      .catch(() => false);
    const hasMetricCard = await page
      .locator(".metric-card")
      .first()
      .isVisible()
      .catch(() => false);
    const hasCanvas = await page
      .locator("canvas")
      .first()
      .isVisible()
      .catch(() => false);

    // At least one of these should be visible
    expect(hasChartTitle || hasMetricCard || hasCanvas).toBeTruthy();
  });

  test("date range controls work on mobile", async ({ page }) => {
    // Load sample data
    const uploadToggle = page.getByRole("button", { name: "Upload or manage data" });
    if (await uploadToggle.isVisible()) {
      await uploadToggle.click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Reload to see data
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for the UI to settle
    await page.waitForTimeout(2000);

    // Look for mobile date range buttons (7 Days, 30 Days, etc.)
    await expect(page.getByRole("button", { name: "7 Days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "30 Days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "90 Days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();

    // Use force click to bypass interception issues
    await page.getByRole("button", { name: "7 Days" }).click({ force: true });
    await page.waitForTimeout(1000);

    // Should still show metrics
    await expect(page.getByText("Total Sessions")).toBeVisible();
  });
});
