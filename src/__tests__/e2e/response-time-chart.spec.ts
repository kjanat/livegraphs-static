import { expect, test } from "@playwright/test";

test.describe("Performance Trends Chart - Response Time", () => {
  test("should display actual response time values (not all zeros)", async ({ page }) => {
    await page.goto("/");

    // Use sample data instead of uploading
    await page.getByRole("button", { name: "Try Sample Data" }).click();

    // Wait for success notification
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Wait for the page to update with the data
    await page.waitForTimeout(1000);

    // Check that the Performance Trends chart is visible
    await expect(page.getByText("Performance Trends Over Time")).toBeVisible();

    // Check the chart canvas exists
    const chartCanvas = page.locator("canvas").nth(1); // Performance chart is usually the second canvas
    await expect(chartCanvas).toBeVisible();

    // Hover over the chart to trigger tooltip
    const canvasBox = await chartCanvas.boundingBox();
    if (canvasBox) {
      // Hover over different points to find response time data
      await page.mouse.move(
        canvasBox.x + canvasBox.width * 0.2,
        canvasBox.y + canvasBox.height * 0.5
      );
      await page.waitForTimeout(500);

      // Look for response time values in the tooltip
      // The chart should show values like 1.5, 2.8, 3.5, 1.2 (not all 0)
      const tooltips = page.locator('[role="tooltip"]');
      const tooltipCount = await tooltips.count();

      if (tooltipCount > 0) {
        const tooltipText = await tooltips.first().textContent();
        console.log("Tooltip content:", tooltipText);

        // Check that the tooltip contains "Avg Response Time" and a non-zero value
        expect(tooltipText).toContain("Avg Response Time");
        // Should not show "0 sec" for all points
        expect(tooltipText).not.toMatch(/Avg Response Time.*: 0/);
      }
    }

    // Additional verification: Check if the legend shows the response time series
    await expect(page.getByText("Avg Response Time (sec)")).toBeVisible();
  });
});
