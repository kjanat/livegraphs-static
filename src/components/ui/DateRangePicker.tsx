"use client";

import { format, subMonths } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-fixed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARD_CONFIG } from "@/lib/config/dashboard";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
  availableDates?: Set<string>; // ISO date strings for dates with data
}

export function DateRangePicker({
  minDate,
  maxDate,
  onDateRangeChange,
  isLoading = false,
  availableDates
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"start" | "end">("start");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Set default date range based on config
  useEffect(() => {
    if (minDate && maxDate && !dateRange) {
      const max = new Date(maxDate);
      const min = new Date(minDate);
      let defaultStart: Date;

      switch (DASHBOARD_CONFIG.defaultDateRange) {
        case "all":
          defaultStart = min;
          break;
        case "last-month":
          defaultStart = subMonths(max, 1);
          break;
        case "last-3-months":
          defaultStart = subMonths(max, 3);
          break;
        case "last-week":
          defaultStart = new Date(max);
          defaultStart.setDate(defaultStart.getDate() - 7);
          break;
        default:
          // Custom number of days
          if (typeof DASHBOARD_CONFIG.defaultDateRange === "number") {
            defaultStart = new Date(max);
            defaultStart.setDate(defaultStart.getDate() - DASHBOARD_CONFIG.defaultDateRange);
          } else {
            defaultStart = min; // Fallback to all data
          }
      }

      // Ensure defaultStart is not before minDate
      if (defaultStart < min) {
        defaultStart = min;
      }

      const initialRange = { from: defaultStart, to: max };
      setDateRange(initialRange);
      setTempDateRange(initialRange);

      // Trigger initial load with end date at end of day
      if (DASHBOARD_CONFIG.autoLoadData) {
        const endOfDay = new Date(max);
        endOfDay.setHours(23, 59, 59, 999);
        onDateRangeChange(defaultStart, endOfDay);
      }
    }
  }, [minDate, maxDate, dateRange, onDateRangeChange]);

  // Validate date selection
  const validateDateRange = useCallback(
    (from: Date, to: Date): string | null => {
      if (from > to) {
        return "Start date must be before end date";
      }

      // Check if there's any data in the selected range
      if (availableDates && availableDates.size > 0) {
        const hasData = Array.from(availableDates).some((dateStr) => {
          const date = new Date(dateStr);
          return date >= from && date <= to;
        });

        if (!hasData) {
          return "No data available for the selected date range";
        }
      }

      return null;
    },
    [availableDates]
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Clear any previous validation errors
    setValidationError(null);

    // If we have a complete range already, start a new selection
    if (tempDateRange?.from && tempDateRange?.to) {
      setTempDateRange({ from: date, to: undefined });
      setSelectionMode("end");
      return;
    }

    // Custom two-click behavior
    if (selectionMode === "start") {
      // First click - set start date
      setTempDateRange({ from: date, to: undefined });
      setSelectionMode("end");
    } else {
      // Second click - set end date
      if (tempDateRange?.from) {
        let newRange: DateRange;

        // If clicked date is before start date, swap them
        if (date < tempDateRange.from) {
          newRange = { from: date, to: tempDateRange.from };
        } else {
          newRange = { from: tempDateRange.from, to: date };
        }

        setTempDateRange(newRange);

        // Validate the range
        if (newRange.from && newRange.to) {
          const error = validateDateRange(newRange.from, newRange.to);
          if (error) {
            setValidationError(error);
          }
        }
      }
    }
  };

  const handleApply = useCallback(() => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const start = new Date(tempDateRange.from);
      const end = new Date(tempDateRange.to);

      // Final validation
      const error = validateDateRange(start, end);
      if (error) {
        setValidationError(error);
        return;
      }

      // Ensure end date includes the entire day
      end.setHours(23, 59, 59, 999);
      setDateRange(tempDateRange);
      onDateRangeChange(start, end);
      setIsOpen(false);
      setValidationError(null);
    }
  }, [tempDateRange, onDateRangeChange, validateDateRange]);

  const handleClose = useCallback(() => {
    setTempDateRange(dateRange); // Reset to saved range
    setSelectionMode("start");
    setIsOpen(false);
    setValidationError(null);
  }, [dateRange]);

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

    // Validate the preset range
    const error = validateDateRange(start, max);
    if (error) {
      setValidationError(error);
      return;
    }

    setDateRange(range);
    setTempDateRange(range);
    setSelectionMode("start"); // Reset selection mode
    setActivePreset(preset);
    setValidationError(null);

    // Ensure end date includes the entire day
    const endOfDay = new Date(max);
    endOfDay.setHours(23, 59, 59, 999);

    onDateRangeChange(start, endOfDay);
  };

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (
        e.key === "Enter" &&
        tempDateRange?.from &&
        tempDateRange?.to &&
        !validationError
      ) {
        handleApply();
      }
    },
    [tempDateRange, validationError, handleApply, handleClose]
  );

  return (
    <Card
      className="mb-8 transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/20"
      data-date-range-picker
      aria-label="Date range selection"
    >
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Date Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading data...</span>
            </div>
          </div>
        )}

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activePreset === "lastWeek" ? "default" : "secondary"}
            size="sm"
            onClick={() => handlePresetRange("lastWeek")}
            disabled={isLoading}
            className={cn(
              "transition-all duration-200",
              activePreset === "lastWeek" && "ring-2 ring-primary/50"
            )}
            aria-pressed={activePreset === "lastWeek"}
          >
            Last Week
          </Button>
          <Button
            variant={activePreset === "lastMonth" ? "default" : "secondary"}
            size="sm"
            onClick={() => handlePresetRange("lastMonth")}
            disabled={isLoading}
            className={cn(
              "transition-all duration-200",
              activePreset === "lastMonth" && "ring-2 ring-primary/50"
            )}
            aria-pressed={activePreset === "lastMonth"}
          >
            Last Month
          </Button>
          <Button
            variant={activePreset === "last3Months" ? "default" : "secondary"}
            size="sm"
            onClick={() => handlePresetRange("last3Months")}
            disabled={isLoading}
            className={cn(
              "transition-all duration-200",
              activePreset === "last3Months" && "ring-2 ring-primary/50"
            )}
            aria-pressed={activePreset === "last3Months"}
          >
            Last 3 Months
          </Button>
          <Button
            variant={activePreset === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => handlePresetRange("all")}
            disabled={isLoading}
            className={cn(
              "transition-all duration-200",
              activePreset === "all" && "ring-2 ring-primary/50"
            )}
            aria-pressed={activePreset === "all"}
          >
            All Data
          </Button>
        </div>

        {/* Calendar picker */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <Popover
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                // Reset temp range and selection mode when opening
                if (open) {
                  setTempDateRange(dateRange);
                  setSelectionMode("start");
                  setActivePreset(null);
                  triggerRef.current?.focus();
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  ref={triggerRef}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:ring-2 focus:ring-primary/50",
                    !dateRange && "text-muted-foreground",
                    isOpen && "ring-2 ring-primary"
                  )}
                  disabled={isLoading}
                  aria-label={
                    dateRange?.from && dateRange?.to
                      ? `Selected date range: ${format(dateRange.from, "MMM d, yyyy")} to ${format(dateRange.to, "MMM d, yyyy")}. Click to change.`
                      : "Click to select a date range"
                  }
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarIcon className="mr-2 h-4 w-4" />
                  )}
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
              <PopoverContent
                className="w-auto p-0"
                align="start"
                onPointerDownOutside={() => {
                  // Allow closing by clicking outside
                  handleClose();
                }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-label="Date range calendar"
              >
                <div className="relative">
                  <div className="p-0">
                    <Calendar
                      mode="single"
                      defaultMonth={tempDateRange?.from || dateRange?.from}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      disabled={(date) => {
                        // Parse dates at start of day in local timezone
                        const dateStart = new Date(date);
                        dateStart.setHours(0, 0, 0, 0);

                        const min = minDate ? new Date(minDate) : new Date("1900-01-01");
                        const max = maxDate ? new Date(maxDate) : new Date("2100-12-31");

                        // Set to end of day for max comparison
                        const maxEnd = new Date(max);
                        maxEnd.setHours(23, 59, 59, 999);

                        const isOutOfRange = dateStart < min || dateStart > maxEnd;

                        // Disable dates without data if availableDates is provided
                        if (!isOutOfRange && availableDates && availableDates.size > 0) {
                          // Format date consistently in local timezone
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          const dateStr = `${year}-${month}-${day}`;
                          return !availableDates.has(dateStr);
                        }

                        return isOutOfRange;
                      }}
                      modifiers={{
                        selected: [
                          ...(tempDateRange?.from ? [tempDateRange.from] : []),
                          ...(tempDateRange?.to ? [tempDateRange.to] : [])
                        ],
                        range_start: tempDateRange?.from ? [tempDateRange.from] : [],
                        range_end: tempDateRange?.to ? [tempDateRange.to] : [],
                        range_middle:
                          tempDateRange?.from && tempDateRange?.to
                            ? {
                                after: tempDateRange.from,
                                before: tempDateRange.to
                              }
                            : []
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 border-t p-3">
                    {/* Validation error */}
                    {validationError && (
                      <div
                        className="text-sm text-destructive flex items-center gap-1"
                        role="alert"
                        aria-live="polite"
                      >
                        <span className="font-medium">⚠</span>
                        {validationError}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {tempDateRange?.from && tempDateRange?.to ? (
                          <>
                            {format(tempDateRange.from, "MMM d, yyyy")} -{" "}
                            {format(tempDateRange.to, "MMM d, yyyy")}
                          </>
                        ) : tempDateRange?.from ? (
                          <span className="font-medium animate-pulse">
                            Click to select end date
                          </span>
                        ) : (
                          <span className="animate-pulse">Click to select start date</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClose}
                          className="transition-all duration-200 hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleApply}
                          disabled={!tempDateRange?.from || !tempDateRange?.to || !!validationError}
                          className={cn(
                            "transition-all duration-200",
                            tempDateRange?.from &&
                              tempDateRange?.to &&
                              !validationError &&
                              "shadow-sm hover:shadow-md"
                          )}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Loading skeleton for date range display */}
        {isLoading && !dateRange ? (
          <Skeleton className="h-4 w-64" aria-label="Loading date range" />
        ) : (
          dateRange?.from &&
          dateRange?.to && (
            <p
              className="text-sm text-muted-foreground animate-in fade-in duration-300"
              aria-live="polite"
              aria-atomic="true"
            >
              Showing data from {format(dateRange.from, "MMM d, yyyy")} to{" "}
              {format(dateRange.to, "MMM d, yyyy")}
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
