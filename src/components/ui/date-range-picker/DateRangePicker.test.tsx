import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addDays, endOfDay, startOfDay, subDays } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

// Helper function to get day buttons from the calendar
const getDayButtons = (includeDisabled = false) => {
  // Day buttons have name="day" attribute
  try {
    const allButtons = screen.getAllByRole("button");
    return allButtons.filter((btn) => {
      const hasNameDay = btn.getAttribute("name") === "day";
      const isDisabled =
        btn.hasAttribute("disabled") || btn.getAttribute("aria-disabled") === "true";
      // Check if it's a day button with name="day" attribute
      if (includeDisabled) {
        return hasNameDay;
      }
      return hasNameDay && !isDisabled;
    });
  } catch {
    // Fallback if no buttons found
    return [];
  }
};

describe("DateRangePicker", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Basic Functionality", () => {
    it("renders the date range picker button", () => {
      render(<DateRangePicker onChange={mockOnChange} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("opens calendar when button is clicked", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);
      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("selects a date range with two clicks", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);
      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Wait for calendar to render
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Click two dates
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]); // Start date
      fireEvent.click(dayButtons[15]); // End date

      // Apply the selection
      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date)
        })
      );
    });
  });

  describe("Duration Constraints", () => {
    it("enforces minimum duration constraint", async () => {
      render(<DateRangePicker onChange={mockOnChange} minDuration={7} showDurationHint={true} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should show duration hint
      expect(screen.getByText("Select at least 7 days")).toBeInTheDocument();

      // Try to select only 3 days
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[12]); // Only 3 days

      // Should not call onChange with invalid range
      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnChange).not.toHaveBeenCalled();

      // Should show error or keep dialog open
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("enforces maximum duration constraint", async () => {
      render(<DateRangePicker onChange={mockOnChange} maxDuration={30} showDurationHint={true} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should show duration hint
      expect(screen.getByText("Select up to 30 days")).toBeInTheDocument();
    });

    it("shows combined min/max duration hint", async () => {
      render(
        <DateRangePicker
          onChange={mockOnChange}
          minDuration={7}
          maxDuration={30}
          showDurationHint={true}
        />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      expect(screen.getByText("Select between 7 and 30 days")).toBeInTheDocument();
    });
  });

  describe("Presets", () => {
    const customPresets = [
      {
        label: "Today",
        shortLabel: "1D",
        value: () => {
          const today = new Date();
          return { from: startOfDay(today), to: endOfDay(today) };
        }
      },
      {
        label: "Yesterday",
        value: () => {
          const yesterday = subDays(new Date(), 1);
          return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
        }
      },
      {
        label: "Last 7 Days",
        shortLabel: "7D",
        value: () => {
          const end = new Date();
          const start = subDays(end, 6);
          return { from: startOfDay(start), to: endOfDay(end) };
        }
      }
    ];

    it("renders custom presets", async () => {
      render(<DateRangePicker onChange={mockOnChange} presets={customPresets} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
      expect(screen.getByText("Last 7 Days")).toBeInTheDocument();
    });

    it("applies preset when clicked", async () => {
      render(<DateRangePicker onChange={mockOnChange} presets={customPresets} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const todayButton = screen.getByText("Today");
      fireEvent.click(todayButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date)
        })
      );
    });

    it("uses short labels on mobile", async () => {
      // Mock mobile viewport
      global.innerWidth = 500;
      global.dispatchEvent(new Event("resize"));

      render(<DateRangePicker onChange={mockOnChange} presets={customPresets} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should show short labels on mobile
      expect(screen.getByText("1D")).toBeInTheDocument();
      expect(screen.getByText("7D")).toBeInTheDocument();
    });
  });

  describe("Disabled Days", () => {
    const isDayDisabled = (date: Date) => {
      // Disable weekends
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    it("disables days based on isDayDisabled function", async () => {
      render(<DateRangePicker onChange={mockOnChange} isDayDisabled={isDayDisabled} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Find all day buttons including disabled ones
      const allDayButtons = getDayButtons(true);
      const disabledDates = allDayButtons.filter(
        (btn) => btn.hasAttribute("disabled") || btn.getAttribute("aria-disabled") === "true"
      );

      expect(disabledDates.length).toBeGreaterThan(0);
    });

    it("supports availableDates for backwards compatibility", async () => {
      const availableDates = new Set([
        new Date().toISOString().split("T")[0],
        addDays(new Date(), 1).toISOString().split("T")[0]
      ]);

      render(<DateRangePicker onChange={mockOnChange} availableDates={availableDates} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Most dates should be disabled except the available ones
      const allDayButtons = getDayButtons(true);
      const enabledDates = allDayButtons.filter(
        (btn) => !btn.hasAttribute("disabled") && btn.getAttribute("aria-disabled") !== "true"
      );

      expect(enabledDates.length).toBeLessThanOrEqual(availableDates.size);
    });
  });

  describe("Responsive Behavior", () => {
    it("shows 2 months on desktop", async () => {
      // Mock desktop viewport
      global.innerWidth = 1024;
      global.dispatchEvent(new Event("resize"));

      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should have 2 month grids
      const monthGrids = screen.getAllByRole("grid");
      expect(monthGrids).toHaveLength(2);
    });

    it("shows 1 month on mobile", async () => {
      // Mock mobile viewport
      global.innerWidth = 500;
      global.dispatchEvent(new Event("resize"));

      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should have 1 month grid
      const monthGrids = screen.getAllByRole("grid");
      expect(monthGrids).toHaveLength(1);
    });

    it("respects custom monthsMobile and monthsDesktop props", async () => {
      // Mock desktop viewport
      global.innerWidth = 1024;
      global.dispatchEvent(new Event("resize"));

      render(<DateRangePicker onChange={mockOnChange} monthsMobile={1} monthsDesktop={3} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should have 3 month grids on desktop
      const monthGrids = screen.getAllByRole("grid");
      expect(monthGrids).toHaveLength(3);
    });
  });

  describe("Loading State", () => {
    it("shows loading state when isLoading is true", () => {
      render(<DateRangePicker onChange={mockOnChange} isLoading={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");

      // Should show loading indicator
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Controlled Component", () => {
    it("displays the controlled value", () => {
      const value = {
        from: new Date(2024, 0, 1),
        to: new Date(2024, 0, 7)
      };

      render(<DateRangePicker onChange={mockOnChange} value={value} />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Jan 1, 2024 - Jan 7, 2024");
    });

    it("updates when value prop changes", () => {
      const { rerender } = render(
        <DateRangePicker
          onChange={mockOnChange}
          value={{
            from: new Date(2024, 0, 1),
            to: new Date(2024, 0, 7)
          }}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Jan 1, 2024 - Jan 7, 2024");

      rerender(
        <DateRangePicker
          onChange={mockOnChange}
          value={{
            from: new Date(2024, 1, 1),
            to: new Date(2024, 1, 7)
          }}
        />
      );

      expect(button).toHaveTextContent("Feb 1, 2024 - Feb 7, 2024");
    });
  });

  describe("Error Handling", () => {
    it("calls onError when validation fails", async () => {
      const mockOnError = vi.fn();

      render(<DateRangePicker onChange={mockOnChange} onError={mockOnError} minDuration={7} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Try to select only 3 days
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[12]); // Only 3 days

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      expect(mockOnError).toHaveBeenCalledWith("Please select at least 7 days");
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes calendar on Escape key", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const dialog = await screen.findByRole("dialog");
      expect(dialog).toBeInTheDocument();

      fireEvent.keyDown(dialog, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("applies selection on Enter key when valid range selected", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Select a valid range
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[15]);

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Enter" });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("does not apply on Enter key when no range selected", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const dialog = await screen.findByRole("dialog");

      fireEvent.keyDown(dialog, { key: "Enter" });

      // Dialog should remain open
      expect(dialog).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("does not apply on Enter key when validation error exists", async () => {
      render(<DateRangePicker onChange={mockOnChange} minDuration={7} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Select invalid range (too short)
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[11]); // Only 2 days

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Enter" });

      // Dialog should remain open due to validation error
      expect(dialog).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Integration Tests - Real User Workflows", () => {
    it("completes full workflow: open, select range, validate, apply", async () => {
      const mockOnChange = vi.fn();

      render(
        <DateRangePicker
          onChange={mockOnChange}
          minDuration={3}
          maxDuration={30}
          showDurationHint={true}
        />
      );

      // User clicks the date picker button
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Select date range");
      fireEvent.click(button);

      // Calendar opens
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // User sees duration hint
      expect(screen.getByText("Select between 3 and 30 days")).toBeInTheDocument();

      // User selects dates
      const dayButtons = getDayButtons();

      // Check initial button states
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();

      // Click first date
      expect(dayButtons.length).toBeGreaterThan(20);
      fireEvent.click(dayButtons[10]);

      // Cancel should now be enabled, Apply still hidden
      expect(cancelButton).not.toBeDisabled();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();

      // Click second date to complete range
      fireEvent.click(dayButtons[15]);

      // Apply should now be visible
      await waitFor(() => {
        expect(screen.getByText("Apply")).toBeInTheDocument();
      });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      // onChange is called
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date)
        })
      );
    });

    it("handles preset selection workflow", async () => {
      const mockOnChange = vi.fn();

      render(<DateRangePicker onChange={mockOnChange} />);

      // Open calendar
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Click "Last 7 Days" preset
      const preset = screen.getByText("Last 7 Days");
      fireEvent.click(preset);

      // Calendar should close immediately
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      // onChange called with correct range
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Date),
          to: expect.any(Date)
        })
      );

      const call = mockOnChange.mock.calls[0][0];
      const daysDiff = Math.floor((call.to - call.from) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(6); // 7 days inclusive
    });

    it("handles error recovery workflow", async () => {
      const mockOnChange = vi.fn();
      const mockOnError = vi.fn();

      render(<DateRangePicker onChange={mockOnChange} onError={mockOnError} minDuration={7} />);

      // Open calendar
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Select invalid range
      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[12]); // Only 3 days

      // Try to apply
      fireEvent.click(screen.getByText("Apply"));

      // Error shown, dialog stays open
      expect(screen.getByText("Please select at least 7 days")).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalled();
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // User corrects selection
      fireEvent.click(dayButtons[20]); // Now 11 days

      // Wait for the Apply button to be enabled again
      await waitFor(() => {
        const applyButton = screen.getByText("Apply");
        expect(applyButton).not.toBeDisabled();
      });

      // Apply again
      fireEvent.click(screen.getByText("Apply"));

      // Success - onChange is called
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid open/close cycles", async () => {
      render(<DateRangePicker onChange={mockOnChange} />);

      const button = screen.getByRole("button");

      // Rapidly open and close
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should end up open
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("preserves selection when canceling", async () => {
      const initialRange = {
        from: new Date(2024, 0, 1),
        to: new Date(2024, 0, 7)
      };

      render(<DateRangePicker onChange={mockOnChange} value={initialRange} />);

      // Should show initial range
      expect(screen.getByRole("button")).toHaveTextContent("Jan 1, 2024 - Jan 7, 2024");

      // Open and make new selection
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[15]);
      fireEvent.click(dayButtons[20]);

      // Cancel instead of apply
      fireEvent.click(screen.getByText("Cancel"));

      // Should still show original range
      expect(screen.getByRole("button")).toHaveTextContent("Jan 1, 2024 - Jan 7, 2024");
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("handles preset with icon rendering", async () => {
      const customPresets = [
        {
          label: "This Week",
          value: () => ({ from: new Date(), to: new Date() })
        }
      ];

      render(<DateRangePicker onChange={mockOnChange} presets={customPresets} />);

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      expect(screen.getByText("This Week")).toBeInTheDocument();
    });
  });

  describe("User Story Scenarios", () => {
    it("shows pre-selected range with disabled Cancel and no Apply button initially", async () => {
      const preSelectedRange = {
        from: new Date(2025, 6, 21), // Jul 21, 2025
        to: new Date(2025, 6, 25) // Jul 25, 2025
      };

      render(<DateRangePicker value={preSelectedRange} onChange={mockOnChange} />);

      // Open calendar
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Check initial button states
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    });

    it("enables Cancel after clicking any date, Apply remains hidden until complete range", async () => {
      render(
        <DateRangePicker
          value={{ from: new Date(2025, 6, 21), to: new Date(2025, 6, 25) }}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      const dayButtons = getDayButtons();

      // Click single date
      fireEvent.click(dayButtons[5]);

      // Cancel enabled, Apply still hidden
      expect(cancelButton).not.toBeDisabled();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    });

    it("shows Apply button only when new complete range differs from current value", async () => {
      const currentRange = { from: new Date(2025, 6, 21), to: new Date(2025, 6, 25) };
      render(<DateRangePicker value={currentRange} onChange={mockOnChange} />);

      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = getDayButtons();

      // Select new range
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[15]);

      // Apply should appear
      await waitFor(() => {
        expect(screen.getByText("Apply")).toBeInTheDocument();
      });
    });

    it("clears pre-selected range on first click regardless of where clicked", async () => {
      render(
        <DateRangePicker
          value={{ from: new Date(2025, 6, 21), to: new Date(2025, 6, 25) }}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = getDayButtons();

      // Click a date - should clear previous selection
      fireEvent.click(dayButtons[22]); // Jul 22 (inside existing range)

      // Click second date
      fireEvent.click(dayButtons[25]);

      // Should have new range selected
      await waitFor(() => {
        expect(screen.getByText("Apply")).toBeInTheDocument();
      });
    });

    it("handles cross-month range selection", async () => {
      render(<DateRangePicker onChange={mockOnChange} monthsDesktop={2} />);

      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = getDayButtons();

      // Assuming we have buttons from multiple months visible
      // Click dates from different months
      fireEvent.click(dayButtons[25]); // Late in first month
      fireEvent.click(dayButtons[dayButtons.length - 20]); // Early in next month

      await waitFor(() => {
        expect(screen.getByText("Apply")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Apply"));
      expect(mockOnChange).toHaveBeenCalled();
    });

    it("maintains clean state when reopening after Apply", async () => {
      const { rerender } = render(<DateRangePicker onChange={mockOnChange} />);

      // First interaction
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dayButtons = getDayButtons();
      fireEvent.click(dayButtons[10]);
      fireEvent.click(dayButtons[15]);
      fireEvent.click(screen.getByText("Apply"));

      // Simulate value update
      const newValue = mockOnChange.mock.calls[0][0];
      rerender(<DateRangePicker value={newValue} onChange={mockOnChange} />);

      // Reopen
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Should show clean state
      expect(screen.getByText("Cancel")).toBeDisabled();
      expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    });
  });
});
