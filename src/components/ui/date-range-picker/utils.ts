import { differenceInDays, endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

/**
 * Validates a date range for completeness and optional duration constraints.
 *
 * Checks that both start and end dates are present, and that the duration in days (inclusive) meets the specified minimum and maximum limits if provided.
 *
 * @param range - The date range to validate
 * @param minDuration - Optional minimum number of days required for the range
 * @param maxDuration - Optional maximum number of days allowed for the range
 * @returns An object indicating whether the range is valid and, if invalid, an explanatory message
 */
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

/**
 * Returns a formatted string representation of a date range.
 *
 * If the start date is missing, returns "Select date range". If only the start date is present, returns the formatted start date. If both dates are present, returns both dates formatted and separated by " - ".
 *
 * @param range - The date range to format
 * @param dateFormat - Optional format string for the dates
 * @returns The formatted date range string
 */
export function formatDateRange(range: DateRange | undefined, dateFormat = "MMM d, yyyy"): string {
  if (!range?.from) return "Select date range";
  if (!range.to) return format(range.from, dateFormat);
  return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
}

/**
 * Returns a date range with the start date before or equal to the end date.
 *
 * If both dates are present and the start date is after the end date, swaps them. Returns the input unchanged if either date is missing.
 *
 * @returns The normalized date range, or the original input if normalization is not needed.
 */
export function normalizeRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from || !range?.to) return range;

  // Ensure from is before to
  if (range.from > range.to) {
    return { from: range.to, to: range.from };
  }

  return range;
}

/**
 * Adjusts the start and end dates of a range to cover the full days.
 *
 * Sets the start date to the beginning of its day and the end date to the end of its day. Returns the original range if either date is missing.
 *
 * @returns The adjusted date range, or the original range if incomplete
 */
export function applyTimeToRange(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from || !range?.to) return range;

  return {
    from: startOfDay(range.from),
    to: endOfDay(range.to)
  };
}

/**
 * Creates a function that determines if a given date should be disabled based on a set of available date strings.
 *
 * @param availableDates - A set of date strings in "yyyy-MM-dd" format representing selectable dates.
 * @returns A function that returns `true` if the date is not in the set (disabled), or `undefined` if no dates are provided.
 */
export function createDisabledDayMatcher(
  availableDates?: Set<string>
): ((date: Date) => boolean) | undefined {
  if (!availableDates || availableDates.size === 0) return undefined;

  return (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !availableDates.has(dateStr);
  };
}
