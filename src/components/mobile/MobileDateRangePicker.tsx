/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics (enhanced with shadcn/ui)
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { format, subMonths } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Set default to last month when dates are available
  useEffect(() => {
    if (minDate && maxDate && !dateRange) {
      const max = new Date(maxDate);
      const lastMonthStart = subMonths(max, 1);
      const defaultStart = lastMonthStart < new Date(minDate) ? new Date(minDate) : lastMonthStart;

      const initialRange = { from: defaultStart, to: max };
      setDateRange(initialRange);

      // Trigger initial load with end date at end of day
      const endOfDay = new Date(max);
      endOfDay.setHours(23, 59, 59, 999);
      onDateRangeChange(defaultStart, endOfDay);
    }
  }, [minDate, maxDate, dateRange, onDateRangeChange]);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    // Apply the range if both dates are selected
    if (range?.from && range?.to) {
      const start = new Date(range.from);
      const end = new Date(range.to);
      // Ensure end date includes the entire day
      end.setHours(23, 59, 59, 999);
      onDateRangeChange(start, end);
      setIsPopoverOpen(false);
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

    const range = { from: start, to: max };
    setDateRange(range);

    // Ensure end date includes the entire day
    const endOfDay = new Date(max);
    endOfDay.setHours(23, 59, 59, 999);

    onDateRangeChange(start, endOfDay);
    setIsExpanded(false);
  };

  return (
    <Card className="mb-4 p-0 transition-all duration-200">
      {/* Compact header - always visible */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 h-auto justify-between hover:bg-muted/50 rounded-lg font-normal"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
              : "Select Date Range"}
          </span>
        </div>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </Button>

      {/* Expandable content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 pb-3 space-y-3 border-t border-border/50">
          {/* Quick presets - horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePresetRange("lastWeek")}
              className="h-7 px-3 text-xs whitespace-nowrap"
            >
              7 Days
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePresetRange("lastMonth")}
              className="h-7 px-3 text-xs whitespace-nowrap"
            >
              30 Days
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePresetRange("last3Months")}
              className="h-7 px-3 text-xs whitespace-nowrap"
            >
              90 Days
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePresetRange("all")}
              className="h-7 px-3 text-xs whitespace-nowrap"
            >
              All
            </Button>
          </div>

          {/* Calendar picker */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="top">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={1}
                disabled={(date) => {
                  const min = minDate ? new Date(minDate) : new Date("1900-01-01");
                  const max = maxDate ? new Date(maxDate) : new Date("2100-12-31");
                  return date < min || date > max;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}
