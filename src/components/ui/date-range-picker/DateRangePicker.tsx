import {
  endOfDay,
  endOfMonth,
  endOfWeek,
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
  const [internalValue, setInternalValue] = useState<DateRange | undefined>(value);
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

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      const normalized = normalizeRange(range);

      if (normalized?.from && normalized?.to) {
        const validation = validateDuration(normalized, minDuration, maxDuration);

        if (!validation.valid) {
          setError(validation.message);
          onError?.(validation.message || "Invalid selection");
          // Don't update internal value on invalid selection
          return;
        }
      }

      // Clear error and update value on valid selection
      setError(undefined);
      setInternalValue(normalized);
    },
    [minDuration, maxDuration, onError]
  );

  const handleApply = useCallback(() => {
    if (internalValue?.from && internalValue?.to) {
      // Re-validate before applying
      const validation = validateDuration(internalValue, minDuration, maxDuration);

      if (!validation.valid) {
        setError(validation.message);
        onError?.(validation.message || "Invalid selection");
        return;
      }

      const withTime = applyTimeToRange(internalValue);
      onChange?.(withTime);
      setOpen(false);
    }
  }, [internalValue, onChange, minDuration, maxDuration, onError]);

  const handlePresetSelect = useCallback(
    (preset: Preset) => {
      const range = preset.value();
      const withTime = applyTimeToRange(range);
      setInternalValue(withTime);
      onChange?.(withTime);
      setOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "Enter" && internalValue?.from && internalValue?.to && !error) {
        handleApply();
      }
    },
    [internalValue, error, handleApply]
  );

  const displayValue = value || internalValue;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
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
              {formatDateRange(displayValue, dateFormat)}
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
              internalValue?.from ||
              (maxDate ? new Date(Math.min(Date.now(), maxDate.getTime())) : new Date())
            }
            selected={internalValue}
            onSelect={handleSelect}
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
                  currentValue={displayValue}
                />
              </div>
            ) : (
              <Presets
                presets={presets}
                onSelect={handlePresetSelect}
                currentValue={displayValue}
              />
            ))}

          <div className="flex gap-2 p-3 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={!internalValue?.from || !internalValue?.to || !!error}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
