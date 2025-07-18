import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format, subMonths } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "../../../components/ui/DateRangePicker";

describe("DateRangePicker", () => {
  const mockOnDateRangeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date inputs and buttons correctly", () => {
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByText("Last Week")).toBeInTheDocument();
    expect(screen.getByText("Last Month")).toBeInTheDocument();
    expect(screen.getByText("Last 3 Months")).toBeInTheDocument();
    expect(screen.getByText("All Data")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("sets default dates to last month when min/max dates are provided", async () => {
    const maxDate = "2024-01-31";
    const minDate = "2023-01-01";

    render(
      <DateRangePicker
        minDate={minDate}
        maxDate={maxDate}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
      const endInput = screen.getByLabelText("End Date") as HTMLInputElement;

      const expectedStart = format(subMonths(new Date(maxDate), 1), "yyyy-MM-dd");
      expect(startInput.value).toBe(expectedStart);
      expect(endInput.value).toBe(maxDate);
      expect(mockOnDateRangeChange).toHaveBeenCalledWith(
        new Date(expectedStart),
        new Date(maxDate)
      );
    });
  });

  it("handles manual date input changes", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;

    await user.clear(startInput);
    await user.type(startInput, "2024-01-01");

    await user.clear(endInput);
    await user.type(endInput, "2024-01-31");

    expect(startInput.value).toBe("2024-01-01");
    expect(endInput.value).toBe("2024-01-31");
  });

  it("adjusts end date when start date is after end date", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;

    // Set end date first
    await user.clear(endInput);
    await user.type(endInput, "2024-01-15");

    // Set start date after end date
    await user.clear(startInput);
    await user.type(startInput, "2024-01-20");

    expect(endInput.value).toBe("2024-01-20");
  });

  it("calls onDateRangeChange when Apply button is clicked", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;
    const applyButton = screen.getByText("Apply");

    await user.clear(startInput);
    await user.type(startInput, "2024-01-01");

    await user.clear(endInput);
    await user.type(endInput, "2024-01-31");

    await user.click(applyButton);

    expect(mockOnDateRangeChange).toHaveBeenCalledWith(
      new Date("2024-01-01"),
      new Date("2024-01-31")
    );
  });

  it("does not call onDateRangeChange when Apply is clicked without dates", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const applyButton = screen.getByText("Apply");
    await user.click(applyButton);

    // Should not be called (no initial call since no min/max dates provided)
    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(0);
  });

  describe("Quick selection buttons", () => {
    it("sets last week date range", async () => {
      const user = userEvent.setup();
      const maxDate = "2024-01-31";
      const minDate = "2023-01-01";

      render(
        <DateRangePicker
          minDate={minDate}
          maxDate={maxDate}
          onDateRangeChange={mockOnDateRangeChange}
        />
      );

      // Wait for initial setup
      await waitFor(() => {
        expect(mockOnDateRangeChange).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const lastWeekButton = screen.getByText("Last Week");
      await user.click(lastWeekButton);

      const expectedEnd = new Date(maxDate);
      const expectedStart = new Date(maxDate);
      expectedStart.setDate(expectedStart.getDate() - 7);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(expectedStart, expectedEnd);
    });

    it("sets last month date range", async () => {
      const user = userEvent.setup();
      const maxDate = "2024-01-31";
      const minDate = "2023-01-01";

      render(
        <DateRangePicker
          minDate={minDate}
          maxDate={maxDate}
          onDateRangeChange={mockOnDateRangeChange}
        />
      );

      await waitFor(() => {
        expect(mockOnDateRangeChange).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const lastMonthButton = screen.getByText("Last Month");
      await user.click(lastMonthButton);

      const expectedEnd = new Date(maxDate);
      const expectedStart = subMonths(expectedEnd, 1);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(expectedStart, expectedEnd);
    });

    it("sets last 3 months date range", async () => {
      const user = userEvent.setup();
      const maxDate = "2024-01-31";
      const minDate = "2023-01-01";

      render(
        <DateRangePicker
          minDate={minDate}
          maxDate={maxDate}
          onDateRangeChange={mockOnDateRangeChange}
        />
      );

      await waitFor(() => {
        expect(mockOnDateRangeChange).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const last3MonthsButton = screen.getByText("Last 3 Months");
      await user.click(last3MonthsButton);

      const expectedEnd = new Date(maxDate);
      const expectedStart = subMonths(expectedEnd, 3);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(expectedStart, expectedEnd);
    });

    it("sets all data date range", async () => {
      const user = userEvent.setup();
      const maxDate = "2024-01-31";
      const minDate = "2023-01-01";

      render(
        <DateRangePicker
          minDate={minDate}
          maxDate={maxDate}
          onDateRangeChange={mockOnDateRangeChange}
        />
      );

      await waitFor(() => {
        expect(mockOnDateRangeChange).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const allDataButton = screen.getByText("All Data");
      await user.click(allDataButton);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(new Date(minDate), new Date(maxDate));
    });
  });

  it("respects min and max date constraints", async () => {
    const minDate = "2024-01-01";
    const maxDate = "2024-12-31";

    render(
      <DateRangePicker
        minDate={minDate}
        maxDate={maxDate}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Wait for the component to set default dates
    await waitFor(() => {
      const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
      expect(startInput.value).toBeTruthy();
    });

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;

    expect(startInput.getAttribute("min")).toBe(minDate);
    expect(startInput.getAttribute("max")).toBe(maxDate);
    // End date min is dynamically set based on start date value
    expect(endInput.getAttribute("min")).toBe(startInput.value || minDate);
    expect(endInput.getAttribute("max")).toBe(maxDate);
  });

  it("handles edge case when minDate is recent", async () => {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    const minDate = format(tenDaysAgo, "yyyy-MM-dd");
    const maxDate = format(today, "yyyy-MM-dd");

    render(
      <DateRangePicker
        minDate={minDate}
        maxDate={maxDate}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Should use minDate as start since last month would be before minDate
      const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
      expect(startInput.value).toBe(minDate);
    });
  });

  it("updates end date min constraint based on start date", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;

    await user.clear(startInput);
    await user.type(startInput, "2024-01-15");

    expect(endInput.getAttribute("min")).toBe("2024-01-15");
  });

  it("displays date range text when dates are selected", async () => {
    const maxDate = "2024-01-31";
    const minDate = "2023-01-01";

    render(
      <DateRangePicker
        minDate={minDate}
        maxDate={maxDate}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Showing data from/)).toBeInTheDocument();
    });
  });

  it("handles preset button clicks without maxDate", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const lastWeekButton = screen.getByText("Last Week");
    await user.click(lastWeekButton);

    // Should not call onDateRangeChange without maxDate
    expect(mockOnDateRangeChange).not.toHaveBeenCalled();
  });

  it("ensures start date is not before minDate for presets", async () => {
    const user = userEvent.setup();
    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 5);

    const minDate = format(fiveDaysAgo, "yyyy-MM-dd");
    const maxDate = format(today, "yyyy-MM-dd");

    render(
      <DateRangePicker
        minDate={minDate}
        maxDate={maxDate}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      expect(mockOnDateRangeChange).toHaveBeenCalled();
    });

    vi.clearAllMocks();

    // Click Last Week which would normally go 7 days back
    const lastWeekButton = screen.getByText("Last Week");
    await user.click(lastWeekButton);

    // Should use minDate as start since 7 days back would be before minDate
    expect(mockOnDateRangeChange).toHaveBeenCalledWith(new Date(minDate), new Date(maxDate));
  });

  it("disables Apply button when dates are not selected", () => {
    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const applyButton = screen.getByText("Apply");
    expect(applyButton).toBeDisabled();
  });

  it("enables Apply button when both dates are selected", async () => {
    const user = userEvent.setup();

    render(<DateRangePicker onDateRangeChange={mockOnDateRangeChange} />);

    const startInput = screen.getByLabelText("Start Date") as HTMLInputElement;
    const endInput = screen.getByLabelText("End Date") as HTMLInputElement;
    const applyButton = screen.getByText("Apply");

    expect(applyButton).toBeDisabled();

    await user.type(startInput, "2024-01-01");
    await user.type(endInput, "2024-01-31");

    expect(applyButton).not.toBeDisabled();
  });
});
