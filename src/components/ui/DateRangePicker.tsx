"use client";

import { format, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ minDate, maxDate, onDateRangeChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
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
  };

  return (
    <Card className="mb-8 transition-all duration-200 hover:shadow-lg" data-date-range-picker>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Date Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handlePresetRange("lastWeek")}>
            Last Week
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePresetRange("lastMonth")}>
            Last Month
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePresetRange("last3Months")}>
            Last 3 Months
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePresetRange("all")}>
            All Data
          </Button>
        </div>

        {/* Calendar picker */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
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

        {dateRange?.from && dateRange?.to && (
          <p className="text-sm text-muted-foreground">
            Showing data from {format(dateRange.from, "MMM d, yyyy")} to{" "}
            {format(dateRange.to, "MMM d, yyyy")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
