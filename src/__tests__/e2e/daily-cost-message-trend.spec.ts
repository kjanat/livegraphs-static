import { expect, test } from "@playwright/test";

test.describe("Daily Cost & Message Volume Trend Chart", () => {
  test("should display both cost and message count data series", async ({ page }) => {
    await page.goto("/");

    // Load sample data
    await page.getByRole("button", { name: "Try Sample Data" }).click();
    await expect(page.getByText(/Successfully loaded \d+ sample sessions/)).toBeVisible({
      timeout: 10000
    });

    // Wait for the page to update with the data
    await page.waitForTimeout(1000);

    // Expand the Category & Cost Analysis section if needed
    const sectionTitle = page.getByText("Category & Cost Analysis");
    const sectionContainer = sectionTitle.locator("..");

    // Check if section is collapsed (look for chevron rotation)
    const chevron = sectionContainer.locator("svg").first();
    const isCollapsed = await chevron.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      return transform && transform !== "none";
    });

    if (isCollapsed) {
      await sectionTitle.click();
      await page.waitForTimeout(500); // Wait for expansion animation
    }

    // Check that the chart title is updated
    await expect(page.getByText("Daily Cost & Message Volume Trend")).toBeVisible();

    // Check that both data series are in the legend
    await expect(page.getByText("Daily Cost (€)")).toBeVisible();
    await expect(page.getByText("Message Count")).toBeVisible();

    // Verify the chart canvas exists
    const chartSection = page.locator("text=Daily Cost & Message Volume Trend").locator("..");
    const chartCanvas = chartSection.locator("canvas").first();
    await expect(chartCanvas).toBeVisible();

    // Hover over the chart to trigger tooltip
    const canvasBox = await chartCanvas.boundingBox();
    if (canvasBox) {
      // Hover over a point on the chart
      await page.mouse.move(
        canvasBox.x + canvasBox.width * 0.5,
        canvasBox.y + canvasBox.height * 0.5
      );
      await page.waitForTimeout(500);

      // Look for tooltip with both values
      const tooltips = page.locator('[role="tooltip"]');
      const tooltipCount = await tooltips.count();

      if (tooltipCount > 0) {
        const tooltipText = await tooltips.first().textContent();
        console.log("Tooltip content:", tooltipText);

        // The tooltip should show both Daily Cost and Message Count
        expect(tooltipText).toContain("Daily Cost");
        expect(tooltipText).toContain("Message Count");
      }
    }
  });
});
