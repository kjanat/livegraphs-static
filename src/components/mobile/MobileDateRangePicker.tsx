/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics (enhanced with shadcn/ui)
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { format, subMonths } from "date-fns";
import { CalendarIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-fixed";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DASHBOARD_CONFIG } from "@/lib/config/dashboard";
import { cn } from "@/lib/utils";

interface MobileDateRangePickerProps {
  minDate?: string;
  maxDate?: string;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
  availableDates?: Set<string>; // ISO date strings for dates with data
}

export function MobileDateRangePicker({
  minDate,
  maxDate,
  onDateRangeChange,
  isLoading = false,
  availableDates
}: MobileDateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"start" | "end">("start");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

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

    // Haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }

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
            // Haptic feedback for error
            if ("vibrate" in navigator) {
              navigator.vibrate([50, 50, 50]);
            }
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
        // Haptic feedback for error
        if ("vibrate" in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
        return;
      }

      // Ensure end date includes the entire day
      end.setHours(23, 59, 59, 999);
      setDateRange(tempDateRange);
      onDateRangeChange(start, end);
      setIsPopoverOpen(false);
      setIsExpanded(false);
      setValidationError(null);

      // Success haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(20);
      }
    }
  }, [tempDateRange, onDateRangeChange, validateDateRange]);

  const handleClose = useCallback(() => {
    setTempDateRange(dateRange); // Reset to saved range
    setSelectionMode("start");
    setIsPopoverOpen(false);
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
      // Haptic feedback for error
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
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
    setIsExpanded(false);

    // Success haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(15);
    }
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
      className="mb-4 p-0 transition-all duration-200 relative overflow-hidden"
      aria-label="Date range selection"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      {/* Compact header - always visible */}
      <Button
        ref={expandButtonRef}
        variant="ghost"
        onClick={() => {
          setIsExpanded(!isExpanded);
          // Haptic feedback
          if ("vibrate" in navigator) {
            navigator.vibrate(10);
          }
        }}
        className={cn(
          "w-full p-3 h-auto justify-between hover:bg-muted/50 rounded-lg font-normal",
          "transition-all duration-200 active:scale-[0.98]",
          isExpanded && "bg-muted/50"
        )}
        disabled={isLoading}
        aria-expanded={isExpanded}
        aria-controls="date-range-content"
        aria-label={
          dateRange?.from && dateRange?.to
            ? `Date range: ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d, yyyy")}. Tap to ${isExpanded ? "collapse" : "expand"}.`
            : "Tap to select date range"
        }
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          )}
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
        id="date-range-content"
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isExpanded}
      >
        <div className="px-3 pb-3 space-y-3 border-t border-border/50">
          {/* Validation error */}
          {validationError && (
            <div
              className="text-sm text-destructive flex items-center gap-1 px-2 py-1 bg-destructive/10 rounded-md"
              role="alert"
              aria-live="polite"
            >
              <span className="font-medium">⚠</span>
              {validationError}
            </div>
          )}

          {/* Quick presets - horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            <Button
              variant={activePreset === "lastWeek" ? "default" : "secondary"}
              size="sm"
              onClick={() => handlePresetRange("lastWeek")}
              className={cn(
                "h-7 px-3 text-xs whitespace-nowrap transition-all duration-200",
                "active:scale-95",
                activePreset === "lastWeek" && "ring-2 ring-primary/50"
              )}
              disabled={isLoading}
              aria-pressed={activePreset === "lastWeek"}
            >
              7 Days
            </Button>
            <Button
              variant={activePreset === "lastMonth" ? "default" : "secondary"}
              size="sm"
              onClick={() => handlePresetRange("lastMonth")}
              className={cn(
                "h-7 px-3 text-xs whitespace-nowrap transition-all duration-200",
                "active:scale-95",
                activePreset === "lastMonth" && "ring-2 ring-primary/50"
              )}
              disabled={isLoading}
              aria-pressed={activePreset === "lastMonth"}
            >
              30 Days
            </Button>
            <Button
              variant={activePreset === "last3Months" ? "default" : "secondary"}
              size="sm"
              onClick={() => handlePresetRange("last3Months")}
              className={cn(
                "h-7 px-3 text-xs whitespace-nowrap transition-all duration-200",
                "active:scale-95",
                activePreset === "last3Months" && "ring-2 ring-primary/50"
              )}
              disabled={isLoading}
              aria-pressed={activePreset === "last3Months"}
            >
              90 Days
            </Button>
            <Button
              variant={activePreset === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => handlePresetRange("all")}
              className={cn(
                "h-7 px-3 text-xs whitespace-nowrap transition-all duration-200",
                "active:scale-95",
                activePreset === "all" && "ring-2 ring-primary/50"
              )}
              disabled={isLoading}
              aria-pressed={activePreset === "all"}
            >
              All
            </Button>
          </div>

          {/* Calendar picker */}
          <Popover
            open={isPopoverOpen}
            onOpenChange={(open) => {
              setIsPopoverOpen(open);
              // Reset temp range and selection mode when opening
              if (open) {
                setTempDateRange(dateRange);
                setSelectionMode("start");
                setActivePreset(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal transition-all duration-200",
                  "active:scale-[0.98]",
                  !dateRange && "text-muted-foreground",
                  isPopoverOpen && "ring-2 ring-primary"
                )}
                disabled={isLoading}
                aria-label={
                  dateRange?.from && dateRange?.to
                    ? `Selected: ${format(dateRange.from, "MMM d, yyyy")} to ${format(dateRange.to, "MMM d, yyyy")}. Tap to change.`
                    : "Tap to open calendar"
                }
                aria-haspopup="dialog"
                aria-expanded={isPopoverOpen}
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
              className="w-auto p-0 max-w-[95vw]"
              align="center"
              side="top"
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
                    numberOfMonths={1}
                    disabled={(date) => {
                      const min = minDate ? new Date(minDate) : new Date("1900-01-01");
                      const max = maxDate ? new Date(maxDate) : new Date("2100-12-31");
                      const isOutOfRange = date < min || date > max;

                      // Disable dates without data if availableDates is provided
                      if (!isOutOfRange && availableDates && availableDates.size > 0) {
                        const dateStr = date.toISOString().split("T")[0];
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
                  {/* Validation error in popover */}
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

                  <div className="text-sm text-muted-foreground text-center">
                    {tempDateRange?.from && tempDateRange?.to ? (
                      <>
                        {format(tempDateRange.from, "MMM d")} -{" "}
                        {format(tempDateRange.to, "MMM d, yyyy")}
                      </>
                    ) : tempDateRange?.from ? (
                      <span className="font-medium animate-pulse">Tap to select end date</span>
                    ) : (
                      <span className="animate-pulse">Tap to select start date</span>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      className="flex-1 active:scale-95"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      disabled={!tempDateRange?.from || !tempDateRange?.to || !!validationError}
                      className={cn(
                        "flex-1 active:scale-95",
                        tempDateRange?.from && tempDateRange?.to && !validationError && "shadow-sm"
                      )}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}
