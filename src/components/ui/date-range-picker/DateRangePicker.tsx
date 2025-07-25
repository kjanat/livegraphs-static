import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange, Matcher } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "./hooks/useBreakpoint";
import { PresetSelector } from "./PresetSelector";
import { Presets } from "./Presets";
import type { DateRangePickerProps, Preset } from "./types";
import {
  applyTimeToRange,
  createDisabledDayMatcher,
  formatDateRange,
  normalizeRange,
  validateDuration
} from "./utils";

const defaultPresets: Preset[] = [
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
    shortLabel: "Y",
    value: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    }
  },
  {
    label: "This Week",
    shortLabel: "1W",
    value: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date())
    })
  },
  {
    label: "Last Week",
    shortLabel: "LW",
    value: () => ({
      from: startOfWeek(subDays(new Date(), 7)),
      to: endOfWeek(subDays(new Date(), 7))
    })
  },
  {
    label: "Last 7 Days",
    shortLabel: "7D",
    value: () => {
      const end = new Date();
      const start = subDays(end, 6);
      return { from: startOfDay(start), to: endOfDay(end) };
    }
  },
  {
    label: "This Month",
    shortLabel: "1M",
    value: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "Last Month",
    shortLabel: "LM",
    value: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      };
    }
  },
  {
    label: "Last 3 Months",
    shortLabel: "3M",
    value: () => {
      const end = new Date();
      const start = subDays(end, 89);
      return { from: startOfDay(start), to: endOfDay(end) };
    }
  }
];

/**
 * Renders a date range picker component with optional presets, validation, and responsive calendar UI.
 *
 * Allows users to select a date range within specified constraints, choose from preset ranges, and apply or cancel their selection. Supports minimum and maximum duration limits, disabled and available date constraints, localization, custom date formatting, and loading state. The component adapts its calendar display for desktop and mobile, and provides error feedback for invalid selections.
 *
 * @returns The rendered date range picker UI component.
 */
export function DateRangePicker({
  value,
  onChange,
  minDuration,
  maxDuration,
  showDurationHint = true,
  minDate,
  maxDate,
  presets = defaultPresets,
  locale,
  dateFormat,
  isDayDisabled,
  availableDates,
  monthsMobile = 1,
  monthsDesktop = 2,
  isLoading = false,
  className,
  onError,
  showPresetCombobox = false
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"idle" | "selecting-start" | "selecting-end">(
    "idle"
  );
  const [tempRange, setTempRange] = useState<DateRange | undefined>();
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | undefined>();
  const isDesktop = useIsDesktop();

  // Determine number of months to show
  const numberOfMonths = isDesktop ? monthsDesktop : monthsMobile;

  // Create disabled day matcher combining all constraints
  const disabledDayMatcher = useMemo(() => {
    const matchers: Array<Matcher | ((date: Date) => boolean)> = [];

    // Add min/max date constraints
    if (minDate) {
      matchers.push({ before: minDate });
    }
    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    // Add custom disabled day function
    if (isDayDisabled) {
      matchers.push(isDayDisabled);
    }

    // Add available dates matcher
    if (availableDates) {
      const availableDatesMatcher = createDisabledDayMatcher(availableDates);
      if (availableDatesMatcher) {
        matchers.push(availableDatesMatcher);
      }
    }

    // Return single matcher, array of matchers, or undefined
    if (matchers.length === 0) return undefined;
    if (matchers.length === 1) return matchers[0];
    return matchers;
  }, [isDayDisabled, availableDates, minDate, maxDate]);

  // Reset selection state when popover opens/closes
  useEffect(() => {
    if (!open) {
      setSelectionMode("idle");
      setTempRange(undefined);
      setHoveredDate(undefined);
      setError(undefined);
    }
  }, [open]);

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      // react-day-picker calls this when a range is being selected
      if (!range) {
        // User clicked the same date or outside - reset
        setTempRange(undefined);
        setSelectionMode("idle");
        return;
      }

      if (!range.from) {
        // Should not happen in range mode
        return;
      }

      // Check if this is a single date click (from and to are same)
      const isSingleClick = range.to && isSameDay(range.from, range.to);
      
      if (!range.to || isSingleClick) {
        // First click or single date - start selection
        setTempRange({ from: range.from, to: undefined });
        setSelectionMode("selecting-end");
        setError(undefined);
      } else {
        // Range completed with different dates
        const normalized = normalizeRange(range);
        if (normalized) {
          setTempRange(normalized);
          setSelectionMode("selecting-end");

          // Validate if needed
          if (minDuration || maxDuration) {
            const validation = validateDuration(normalized, minDuration, maxDuration);
            if (!validation.valid) {
              setError(validation.message);
              onError?.(validation.message || "Invalid selection");
              return;
            }
          }

          setError(undefined);
        }
      }
    },
    [minDuration, maxDuration, onError]
  );

  const handleDayMouseEnter = useCallback(
    (date: Date | undefined) => {
      if (date && selectionMode === "selecting-end") {
        setHoveredDate(date);
      }
    },
    [selectionMode]
  );

  const handleDayMouseLeave = useCallback(() => {
    setHoveredDate(undefined);
  }, []);

  const handleApply = useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      const withTime = applyTimeToRange(tempRange);
      onChange?.(withTime);
      setOpen(false);
    }
  }, [tempRange, onChange]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handlePresetSelect = useCallback(
    (preset: Preset) => {
      const range = preset.value();
      const withTime = applyTimeToRange(range);
      onChange?.(withTime);
      setOpen(false);
    },
    [onChange]
  );

  // Compute display range for the calendar
  const displayRange = useMemo(() => {
    if (selectionMode === "selecting-end" && tempRange?.from && hoveredDate) {
      return normalizeRange({ from: tempRange.from, to: hoveredDate });
    }
    // CRITICAL: Fall back to value to show pre-selected range
    return tempRange ?? value;
  }, [selectionMode, tempRange, hoveredDate, value]);

  // Determine button states
  const showApplyButton = useMemo(() => {
    if (!tempRange?.from || !tempRange?.to || error) return false;
    if (!value?.from || !value?.to) return true;
    return !isSameDay(tempRange.from, value.from) || !isSameDay(tempRange.to, value.to);
  }, [tempRange, value, error]);

  const cancelDisabled = selectionMode === "idle";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && !cancelDisabled) {
        handleCancel();
      } else if (e.key === "Enter" && showApplyButton) {
        handleApply();
      }
    },
    [cancelDisabled, showApplyButton, handleCancel, handleApply]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
              Loading...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(value, dateFormat)}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-screen max-w-[calc(100vw-2rem)] md:w-auto p-0"
        align="start"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col">
          <Calendar
            mode="range"
            defaultMonth={
              value?.from ||
              (maxDate ? new Date(Math.min(Date.now(), maxDate.getTime())) : new Date())
            }
            selected={displayRange}
            onSelect={handleSelect}
            onDayMouseEnter={handleDayMouseEnter}
            onDayMouseLeave={handleDayMouseLeave}
            numberOfMonths={numberOfMonths}
            disabled={disabledDayMatcher}
            locale={locale}
            fromMonth={minDate}
            toMonth={maxDate}
            className="rounded-lg border shadow-sm w-full md:w-auto"
          />

          {showDurationHint && (minDuration || maxDuration) && (
            <p className="text-xs text-muted-foreground text-center p-3 border-t">
              {minDuration && maxDuration
                ? `Select between ${minDuration} and ${maxDuration} days`
                : minDuration
                  ? `Select at least ${minDuration} days`
                  : `Select up to ${maxDuration} days`}
            </p>
          )}

          {error && <p className="text-xs text-destructive text-center p-2 border-t">{error}</p>}

          {presets.length > 0 &&
            (showPresetCombobox ? (
              <div className="p-3 border-t">
                <PresetSelector
                  presets={presets}
                  onSelect={handlePresetSelect}
                  currentValue={value}
                />
              </div>
            ) : (
              <Presets presets={presets} onSelect={handlePresetSelect} currentValue={value} />
            ))}

          <div className="flex gap-2 p-3 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={cancelDisabled}
            >
              Cancel
            </Button>
            {showApplyButton && (
              <Button className="flex-1" onClick={handleApply}>
                Apply
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
