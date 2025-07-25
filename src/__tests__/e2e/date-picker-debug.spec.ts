import { expect, test } from "@playwright/test";

test.describe("Date Picker Debug", () => {
  test("debug date picker issues", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Take screenshot of initial page
    await page.screenshot({ path: "test-results/1-initial-page.png", fullPage: true });

    // Upload sample data with correct format and recent dates
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("src/__tests__/e2e/test-data-correct.json");

    // Wait and take screenshot after upload
    await page.waitForTimeout(3000);
    await page.screenshot({ path: "test-results/2-after-upload.png", fullPage: true });

    // Debug what's on the page
    const allCards = page.locator(".card");
    const cardCount = await allCards.count();
    console.log("Total cards found:", cardCount);

    // Get all card titles
    for (let i = 0; i < cardCount; i++) {
      const cardText = await allCards.nth(i).textContent();
      console.log(`Card ${i}:`, cardText?.substring(0, 100));
    }

    // Look for date picker more broadly
    const dateRangeElements = page.locator('*:has-text("Date Range")');
    console.log("Elements with 'Date Range':", await dateRangeElements.count());

    // Check for date picker by data attribute
    const datePickerByAttr = page.locator("[data-date-range-picker]");
    console.log("Date picker by attribute:", await datePickerByAttr.count());

    const datePickerCard = datePickerByAttr.first();
    const datePickerExists = await datePickerCard.count();

    if (datePickerExists > 0) {
      // Click the first button in the date picker card
      const buttons = datePickerCard.locator("button");
      const buttonCount = await buttons.count();
      console.log("Buttons in date picker:", buttonCount);

      // Log all button texts
      for (let i = 0; i < buttonCount; i++) {
        const btnText = await buttons.nth(i).textContent();
        console.log(`Button ${i}:`, btnText);
      }

      // Click the button with date text (last button)
      const calendarButton = buttons.nth(4); // The date range button
      if ((await calendarButton.count()) > 0) {
        console.log("Clicking calendar button...");
        await calendarButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: "test-results/3-calendar-open.png", fullPage: true });

        // Look for calendar
        const calendar = page.locator('[role="dialog"]');
        const calendarVisible = await calendar.isVisible();
        console.log("Calendar visible:", calendarVisible);

        if (calendarVisible) {
          // Count months
          const months = calendar.locator(".rdp-month");
          const monthCount = await months.count();
          console.log("Month count:", monthCount);

          // Try different selectors for dates
          const dayButtons = calendar.locator(".rdp-day button");
          console.log("Day buttons (.rdp-day button):", await dayButtons.count());

          const buttonElements = calendar.locator("button");
          console.log("All buttons in calendar:", await buttonElements.count());

          // Log button attributes
          if ((await buttonElements.count()) > 0) {
            for (let i = 0; i < Math.min(5, await buttonElements.count()); i++) {
              const btn = buttonElements.nth(i);
              const text = await btn.textContent();
              const name = await btn.getAttribute("name");
              const ariaLabel = await btn.getAttribute("aria-label");
              console.log(`Button ${i}: text='${text}', name='${name}', aria-label='${ariaLabel}'`);
            }
          }

          const allDates = dayButtons;
          const allDateCount = await allDates.count();
          console.log("Total date buttons:", allDateCount);

          const dates = calendar.locator('button[name="day"]:not(:disabled)');
          const dateCount = await dates.count();
          console.log("Available (not disabled) dates:", dateCount);

          // Check disabled dates
          const disabledDates = calendar.locator('button[name="day"]:disabled');
          console.log("Disabled dates:", await disabledDates.count());

          // Try selecting any date button
          if (allDateCount > 0) {
            const firstDateBtn = allDates.first();
            const isDisabled = await firstDateBtn.isDisabled();
            console.log("First date disabled:", isDisabled);
            const dateText = await firstDateBtn.textContent();
            console.log("First date text:", dateText);
          }

          if (dateCount >= 2) {
            await dates.first().click();
            await page.waitForTimeout(500);
            await page.screenshot({
              path: "test-results/4-first-date-selected.png",
              fullPage: true
            });

            // Click the last available date to create a range
            await dates.last().click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: "test-results/5-range-selected.png", fullPage: true });

            // Check for range styling
            const rangeStarts = calendar.locator('[data-range-start="true"]');
            const rangeEnds = calendar.locator('[data-range-end="true"]');
            const rangeMiddles = calendar.locator('[data-range-middle="true"]');

            console.log("Range starts:", await rangeStarts.count());
            console.log("Range ends:", await rangeEnds.count());
            console.log("Range middles:", await rangeMiddles.count());

            // Check styling classes
            const firstDateClasses = await dates.first().getAttribute("class");
            console.log("First date classes:", firstDateClasses);
          }
        }
      }
    }

    // Always pass to see the console output
    expect(true).toBe(true);
  });
});
