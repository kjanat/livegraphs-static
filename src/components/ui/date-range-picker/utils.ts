import { differenceInDays, endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

export function validateDuration(
  range: DateRange | undefined,
  minDuration?: number,
  maxDuration?: number
): { valid: boolean; message?: string } {
  if (!range?.from || !range?.to) {
    return { valid: false, message: "Please select both start and end dates" };
  }

  const duration = differenceInDays(range.to, range.from) + 1;

  if (minDuration && duration < minDuration) {
    return { valid: false, message: `Please select at least ${minDuration} days` };
  }

  if (maxDuration && duration > maxDuration) {
    return { valid: false, message: `Please select no more than ${maxDuration} days` };
  }

  return { valid: true };
}

export function formatDateRange(range: DateRange | undefined, dateFormat = "MMM d, yyyy"): string {
  if (!range?.from) return "Select date range";
  if (!range.to) return format(range.from, dateFormat);
  return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
}

export function normalizeRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from || !range?.to) return range;

  // Ensure from is before to
  if (range.from > range.to) {
    return { from: range.to, to: range.from };
  }

  return range;
}

export function applyTimeToRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from || !range?.to) return range;

  return {
    from: startOfDay(range.from),
    to: endOfDay(range.to)
  };
}

// Convert availableDates Set to isDayDisabled function for backwards compatibility
export function createDisabledDayMatcher(
  availableDates?: Set<string>
): ((date: Date) => boolean) | undefined {
  if (!availableDates || availableDates.size === 0) return undefined;

  return (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !availableDates.has(dateStr);
  };
}
