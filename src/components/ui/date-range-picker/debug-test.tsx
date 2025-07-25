import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

describe("Debug DateRangePicker", () => {
  it("debug day button selection", async () => {
    const onChange = vi.fn();
    const { container } = render(<DateRangePicker onChange={onChange} />);

    // Open calendar
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Debug: Log all buttons with name="day"
    const allButtons = container.querySelectorAll('button[name="day"]');
    console.log("Found buttons with name='day':", allButtons.length);

    // Debug: Log all buttons in general
    const allButtonsGeneral = container.querySelectorAll("button");
    console.log("Total buttons found:", allButtonsGeneral.length);

    // Debug: Check for data-day attribute
    const dataButtons = container.querySelectorAll("button[data-day]");
    console.log("Found buttons with data-day:", dataButtons.length);

    // Try to find day buttons using the test helper approach
    const dayButtons = screen.getAllByRole("button").filter((btn) => {
      const hasName = btn.getAttribute("name") === "day";
      const hasDataDay = btn.hasAttribute("data-day");
      const text = btn.textContent || "";
      console.log(`Button: text="${text}", name="${btn.getAttribute("name")}", hasDataDay=${hasDataDay}`);
      return hasName;
    });

    console.log("Day buttons found by helper:", dayButtons.length);
  });
});