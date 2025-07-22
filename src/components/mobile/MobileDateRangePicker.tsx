/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { format, subMonths } from "date-fns";
import { useEffect, useState } from "react";
import { CalendarIcon } from "@/components/icons/index";

interface MobileDateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function MobileDateRangePicker({
  minDate,
  maxDate,
  onDateRangeChange
}: MobileDateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Set default to last month when dates are available
  useEffect(() => {
    if (minDate && maxDate && !startDate && !endDate) {
      const max = new Date(maxDate);
      const lastMonthStart = subMonths(max, 1);
      const defaultStart = lastMonthStart < new Date(minDate) ? new Date(minDate) : lastMonthStart;

      setStartDate(format(defaultStart, "yyyy-MM-dd"));
      setEndDate(format(max, "yyyy-MM-dd"));

      // Trigger initial load
      onDateRangeChange(defaultStart, max);
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
      onDateRangeChange(new Date(startDate), new Date(endDate));
      setIsExpanded(false);
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
    onDateRangeChange(start, max);
    setIsExpanded(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm mb-4 transition-all duration-200">
      {/* Compact header - always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium">
            {startDate && endDate
              ? `${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}`
              : "Select Date Range"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>Toggle date picker</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-3 pb-3 space-y-3 border-t border-border/50">
          {/* Quick presets - horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => handlePresetRange("lastWeek")}
              className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors whitespace-nowrap"
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetRange("lastMonth")}
              className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors whitespace-nowrap"
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetRange("last3Months")}
              className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors whitespace-nowrap"
            >
              90 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetRange("all")}
              className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors whitespace-nowrap"
            >
              All
            </button>
          </div>

          {/* Date inputs - stacked on mobile */}
          <div className="space-y-2">
            <div>
              <label
                htmlFor="mobile-start-date"
                className="block text-xs font-medium mb-1 text-muted-foreground"
              >
                From
              </label>
              <input
                id="mobile-start-date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={minDate}
                max={maxDate}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="mobile-end-date"
                className="block text-xs font-medium mb-1 text-muted-foreground"
              >
                To
              </label>
              <input
                id="mobile-end-date"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || minDate}
                max={maxDate}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleApply}
              disabled={!startDate || !endDate}
              className="w-full px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              Apply Date Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
