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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
 * Simple date range picker following the user's specification:
 * - Keeps calendar in plain range mode
 * - Maintains minimal temp state (draft)
 * - Shows Apply only when range is complete and different from current value
 * - Cancel is disabled when no changes have been made
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
  const [draft, setDraft] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [, setIsSelectingEnd] = useState(false);
  const isSelectingEndRef = useRef(false);
  const draftRef = useRef<DateRange | undefined>(undefined);
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

  // Initialize draft with current value when popover opens
  useEffect(() => {
    if (open) {
      setDraft(value);
      draftRef.current = value;
      setIsSelectingEnd(false);
      isSelectingEndRef.current = false;
    } else {
      setDraft(undefined);
      draftRef.current = undefined;
      setError(undefined);
      setIsSelectingEnd(false);
      isSelectingEndRef.current = false;
    }
  }, [open, value]);

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      // Update draft immediately
      setDraft(range);
      draftRef.current = range;

      // Clear error initially
      setError(undefined);

      // Check if this is a complete range (from hovering and selecting)
      if (range?.from && range?.to && !isSameDay(range.from, range.to)) {
        // Complete range selected
        setIsSelectingEnd(false);
        isSelectingEndRef.current = false;

        // Validate the range
        if (minDuration || maxDuration) {
          const validation = validateDuration(range, minDuration, maxDuration);
          if (!validation.valid) {
            setError(validation.message);
            onError?.(validation.message || "Invalid selection");
          }
        }
      } else if (range?.from) {
        // Single date clicked - entering selection mode
        setIsSelectingEnd(true);
        isSelectingEndRef.current = true;
      } else {
        // Cleared selection
        setIsSelectingEnd(false);
        isSelectingEndRef.current = false;
      }
    },
    [minDuration, maxDuration, onError]
  );

  // Handle calendar day clicks since react-day-picker doesn't fire onSelect on second click
  const handleDayClick = useCallback(
    (day: Date, _modifiers: unknown, e: React.MouseEvent) => {
      // Only handle the click if we're selecting the end date
      // Use ref to get immediate value since state updates are async
      if (isSelectingEndRef.current && draftRef.current?.from && !draftRef.current?.to) {
        // Prevent the default calendar behavior
        e?.preventDefault?.();

        // Second click - complete the range
        const newRange = {
          from: draftRef.current.from > day ? day : draftRef.current.from,
          to: draftRef.current.from > day ? draftRef.current.from : day
        };

        setDraft(newRange);
        draftRef.current = newRange;
        setIsSelectingEnd(false);
        isSelectingEndRef.current = false;

        // Validate the range
        if (!isSameDay(newRange.from, newRange.to) && (minDuration || maxDuration)) {
          const validation = validateDuration(newRange, minDuration, maxDuration);
          if (!validation.valid) {
            setError(validation.message);
            onError?.(validation.message || "Invalid selection");
          } else {
            setError(undefined);
          }
        } else {
          setError(undefined);
        }
      }
    },
    [minDuration, maxDuration, onError]
  );

  const handleApply = useCallback(() => {
    if (draft?.from && draft?.to && !error) {
      const withTime = applyTimeToRange(draft);
      onChange?.(withTime);
      setOpen(false);
    }
  }, [draft, error, onChange]);

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

  // Derived state
  const hasStart = !!draft?.from;
  const hasEnd = !!draft?.to;

  const changed = useMemo(() => {
    // Changed if we have any draft that's different from value
    if (!draft?.from && !draft?.to && !value?.from && !value?.to) return false;
    if (!draft?.from && !draft?.to && (value?.from || value?.to)) return true;
    if ((draft?.from || draft?.to) && !value?.from && !value?.to) return true;
    if (draft?.from && value?.from && !isSameDay(draft.from, value.from)) return true;
    if (draft?.to && value?.to && !isSameDay(draft.to, value.to)) return true;
    return false;
  }, [draft, value]);

  const isCompleteRange = useMemo(() => {
    if (!hasStart || !hasEnd || !draft.from || !draft.to) return false;
    // Don't count single-date selections as complete
    return !isSameDay(draft.from, draft.to);
  }, [hasStart, hasEnd, draft]);

  const isDifferentFromValue = useMemo(() => {
    if (!isCompleteRange) return false;
    if (!value?.from || !value?.to) return true;
    if (!draft?.from || !draft?.to) return false;
    return !isSameDay(draft.from, value.from) || !isSameDay(draft.to, value.to);
  }, [isCompleteRange, draft, value]);

  const showApplyButton = true; // Always show Apply button
  const applyDisabled = !isCompleteRange || !isDifferentFromValue || !!error;
  const cancelDisabled = false; // Always allow Cancel for better UX

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if (e.key === "Enter" && !applyDisabled) {
        e.preventDefault();
        handleApply();
      }
    },
    [applyDisabled, handleCancel, handleApply]
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
            selected={draft}
            onSelect={handleSelect}
            onDayClick={handleDayClick}
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
            <Button className="flex-1" onClick={handleApply} disabled={applyDisabled}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
