import { expect, test } from "@playwright/test";

test.describe("Date Picker", () => {
  test.beforeEach(async ({ page }) => {
    // Log any console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("Browser console error:", msg.text());
      }
    });

    await page.goto("http://localhost:3000");

    // Check if the page loaded
    await expect(page).toHaveTitle(/Notso AI/);

    // Upload sample data
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("src/__tests__/e2e/test-data-correct.json");

    // Wait for the dashboard to load - wait for charts container
    await page.waitForSelector('text="Total Sessions"', { timeout: 20000 });

    // Small wait to ensure everything is rendered
    await page.waitForTimeout(500);
  });

  test("should show calendar with two months on desktop", async ({ page }) => {
    // Find the date range button by its date text
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();
    await expect(calendarButton).toBeVisible();

    // Click to open calendar
    await calendarButton.click();

    // Should show calendar popover
    const calendarPopover = page.locator('[role="dialog"]');
    await expect(calendarPopover).toBeVisible();

    // Should show two months on desktop
    const months = calendarPopover.locator(".rdp-month");
    await expect(months).toHaveCount(2);
  });

  test("should highlight selected date range", async ({ page }) => {
    // Open calendar
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();
    await calendarButton.click();

    const calendarPopover = page.locator('[role="dialog"]');

    // Get the first available date button
    const firstDate = calendarPopover.locator('button[name="day"]:not(:disabled)').first();
    await firstDate.click();

    // Should show "Click to select end date" message
    await expect(calendarPopover).toContainText("Click to select end date");

    // Get the last available date
    const endDate = calendarPopover.locator('button[name="day"]:not(:disabled)').last();
    await endDate.click();

    // Should show both dates in the preview
    await expect(calendarPopover).toContainText(/\w+ \d+, \d{4} - \w+ \d+, \d{4}/);

    // Click Apply
    await calendarPopover.locator('button:has-text("Apply")').click();

    // Calendar should close
    await expect(calendarPopover).not.toBeVisible();

    // Wait for data to reload and range to be displayed
    await page.waitForSelector('text="Showing data from"', { timeout: 10000 });
  });

  test("should start new selection when clicking with complete range", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar and select a range
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Select first range
    await calendarPopover.locator('button[name="day"]:not(:disabled)').first().click();
    await calendarPopover.locator('button[name="day"]:not(:disabled)').last().click();
    await calendarPopover.locator('button:has-text("Apply")').click();

    // Open calendar again
    await calendarButton.click();

    // Click a new date - should start fresh selection
    const newStartDate = calendarPopover.locator('button[name="day"]:not(:disabled)').nth(1);
    await newStartDate.click();

    // Should show "Click to select end date" for new selection
    await expect(calendarPopover).toContainText("Click to select end date");

    // Previous range should be cleared - check that we don't have multiple range middles
    const rangeMiddles = calendarPopover.locator('[data-range-middle="true"]');
    await expect(rangeMiddles).toHaveCount(0);
  });

  test("should not highlight outside days in range", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Wait for calendar to be fully rendered
    await page.waitForTimeout(500);

    // Select a range using available dates
    const dates = calendarPopover.locator('button[name="day"]:not(:disabled)');
    await dates.first().click();
    await dates.last().click();

    // Check that outside days don't have range styling
    const outsideDaysWithRange = calendarPopover.locator(
      '[data-outside="true"][data-range-middle="true"]'
    );
    await expect(outsideDaysWithRange).toHaveCount(0);
  });

  test("should show proper styling for dates in range", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Select a range
    const startDate = calendarPopover.locator('button[name="day"]:not(:disabled)').first();
    const endDate = calendarPopover.locator('button[name="day"]:not(:disabled)').last();

    await startDate.click();
    await endDate.click();

    // Check start date has proper data attribute
    await expect(startDate).toHaveAttribute("data-range-start", "true");

    // Check end date has proper data attribute
    await expect(endDate).toHaveAttribute("data-range-end", "true");

    // Check that we have middle dates
    const middleDates = calendarPopover.locator('[data-range-middle="true"]');
    const middleCount = await middleDates.count();
    expect(middleCount).toBeGreaterThan(0);
  });

  test("should handle preset buttons correctly", async ({ page }) => {
    // Click Last Week preset
    await page.locator('button:has-text("Last Week")').click();

    // Wait for data to reload and range to be displayed
    await page.waitForSelector('text="Showing data from"', { timeout: 10000 });

    // Last Week button should have ring styling
    const lastWeekButton = page.locator('button:has-text("Last Week")');
    await expect(lastWeekButton).toHaveClass(/ring-2/);

    // Wait a bit for state to settle
    await page.waitForTimeout(200);

    // Click Last Month preset
    await page.locator('button:has-text("Last Month")').click();

    // Wait for update
    await page.waitForTimeout(200);

    // Date range should update
    await expect(page.locator('text="Showing data from"')).toBeVisible();

    // Last Month button should now have ring styling
    const lastMonthButton = page.locator('button:has-text("Last Month")');
    await expect(lastMonthButton).toHaveClass(/ring-2/);

    // Last Week should not have ring anymore
    await expect(lastWeekButton).not.toHaveClass(/ring-2/);
  });

  test("should validate date selections", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Select end date first, then earlier date - should auto-swap
    const dates = calendarPopover.locator('button[name="day"]:not(:disabled)');
    await dates.last().click();
    await dates.first().click();

    // Apply should be enabled
    const applyButton = calendarPopover.locator('button:has-text("Apply")');
    await expect(applyButton).toBeEnabled();

    // Apply should work
    await applyButton.click();
    await expect(calendarPopover).not.toBeVisible();
  });

  test("should show hover effects on calendar dates", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Get a date to hover
    const dateToHover = calendarPopover.locator('button[name="day"]:not(:disabled)').first();

    // Hover and check for visual change
    await dateToHover.hover();

    // The button should have hover classes applied
    await expect(dateToHover).toHaveClass(/hover:bg-accent/);
  });

  test("should handle keyboard navigation", async ({ page }) => {
    const calendarButton = page
      .locator("button")
      .filter({ hasText: /^\w+ \d+, \d{4} - \w+ \d+, \d{4}$/ })
      .first();

    // Open calendar
    await calendarButton.click();
    const calendarPopover = page.locator('[role="dialog"]');

    // Select dates
    await calendarPopover.locator('button[name="day"]:not(:disabled)').first().click();
    await calendarPopover.locator('button[name="day"]:not(:disabled)').last().click();

    // Focus on Apply button and press Enter
    const applyButton = calendarPopover.locator('button:has-text("Apply")');
    await applyButton.focus();
    await page.keyboard.press("Enter");

    // Calendar should close
    await expect(calendarPopover).not.toBeVisible();

    // Open again
    await calendarButton.click();

    // Press Escape to cancel
    await page.keyboard.press("Escape");

    // Calendar should close
    await expect(calendarPopover).not.toBeVisible();
  });
});
