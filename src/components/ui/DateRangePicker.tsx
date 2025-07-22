"use client";

import { format, subMonths } from "date-fns";
import { useEffect, useState } from "react";

interface DateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ minDate, maxDate, onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Set default to last month when dates are available
  useEffect(() => {
    if (minDate && maxDate && !startDate && !endDate) {
      const max = new Date(maxDate);
      const lastMonthStart = subMonths(max, 1);
      const defaultStart = lastMonthStart < new Date(minDate) ? new Date(minDate) : lastMonthStart;

      setStartDate(format(defaultStart, "yyyy-MM-dd"));
      setEndDate(format(max, "yyyy-MM-dd"));

      // Trigger initial load with end date at end of day
      const endOfDay = new Date(max);
      endOfDay.setHours(23, 59, 59, 999);
      onDateRangeChange(defaultStart, endOfDay);
    }
  }, [minDate, maxDate, startDate, endDate, onDateRangeChange]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);

    // Ensure end date is not before start date
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Ensure end date includes the entire day
      end.setHours(23, 59, 59, 999);
      onDateRangeChange(start, end);
    }
  };

  const handlePresetRange = (preset: "lastWeek" | "lastMonth" | "last3Months" | "all") => {
    if (!maxDate) return;

    const max = new Date(maxDate);
    let start: Date;

    switch (preset) {
      case "lastWeek":
        start = new Date(max);
        start.setDate(start.getDate() - 7);
        break;
      case "lastMonth":
        start = subMonths(max, 1);
        break;
      case "last3Months":
        start = subMonths(max, 3);
        break;
      case "all":
        start = new Date(minDate || max);
        break;
    }

    // Ensure start is not before minDate
    if (minDate && start < new Date(minDate)) {
      start = new Date(minDate);
    }

    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(max, "yyyy-MM-dd"));

    // Ensure end date includes the entire day
    const endOfDay = new Date(max);
    endOfDay.setHours(23, 59, 59, 999);

    onDateRangeChange(start, endOfDay);
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Date Range</h2>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => handlePresetRange("lastWeek")}
          className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors"
        >
          Last Week
        </button>
        <button
          type="button"
          onClick={() => handlePresetRange("lastMonth")}
          className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors"
        >
          Last Month
        </button>
        <button
          type="button"
          onClick={() => handlePresetRange("last3Months")}
          className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors"
        >
          Last 3 Months
        </button>
        <button
          type="button"
          onClick={() => handlePresetRange("all")}
          className="px-3 py-1 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded transition-colors"
        >
          All Data
        </button>
      </div>

      {/* Date inputs - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor="start-date"
            className="block text-sm font-medium mb-1 text-muted-foreground"
          >
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="end-date"
            className="block text-sm font-medium mb-1 text-muted-foreground"
          >
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || minDate}
            max={maxDate}
            className="w-full px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={!startDate || !endDate}
          className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
        >
          Apply
        </button>
      </div>

      {startDate && endDate && (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing data from {format(new Date(startDate), "MMM d, yyyy")} to{" "}
          {format(new Date(endDate), "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
}
