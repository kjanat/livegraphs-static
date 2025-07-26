/**
 * Date utility functions
 */

import { endOfDay, startOfWeek } from "date-fns";

/**
 * Returns the date range for the current working week, starting from Monday up to the end of the specified day.
 *
 * The range begins at the Monday of the week containing the provided date (or today if not specified) and ends at the end of that day.
 *
 * @returns An object with `start` as the Monday of the week and `end` as the end of the specified day.
 */
export function getWorkingWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  // Get the start of the week (Monday)
  const start = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday

  // End is today at end of day
  const end = endOfDay(now);

  return { start, end };
}

/**
 * Asynchronously finds the most recent working week within the specified date range that contains data.
 *
 * Checks if the current working week (Monday to today) has data using the provided check function. If not, iterates backward week-by-week from the week of `dataMax` to `dataMin`, returning the first week found with data. The returned range is adjusted so the end date does not exceed `dataMax`.
 *
 * @param dataMin - The earliest date to consider in the search
 * @param dataMax - The latest date to consider in the search
 * @param checkDataFn - An asynchronous function that determines if a given date range contains data
 * @returns An object with the start and end dates of the found week and a flag indicating if it is the current week, or `null` if no week with data is found
 */
export async function findRecentWorkingWeekWithData(
  dataMin: Date,
  dataMax: Date,
  checkDataFn: (start: Date, end: Date) => Promise<boolean>
): Promise<{ start: Date; end: Date; hasCurrentWeekData: boolean } | null> {
  const now = new Date();
  const currentWeekRange = getWorkingWeekRange(now);

  // First check if current week has data
  // Adjust end date to not exceed dataMax
  const adjustedCurrentWeekEnd = currentWeekRange.end > dataMax ? dataMax : currentWeekRange.end;
  const hasCurrentWeekData = await checkDataFn(currentWeekRange.start, adjustedCurrentWeekEnd);

  if (hasCurrentWeekData) {
    return {
      start: currentWeekRange.start,
      end: adjustedCurrentWeekEnd,
      hasCurrentWeekData: true
    };
  }

  // If not, find the most recent week with data
  // Start from the week of dataMax and work backwards
  const checkDate = new Date(dataMax);

  while (checkDate >= dataMin) {
    const weekRange = getWorkingWeekRange(checkDate);

    // Make sure the week range is within our data bounds
    if (weekRange.start >= dataMin && weekRange.start <= dataMax) {
      // Adjust end date to not exceed dataMax
      const adjustedEnd = weekRange.end > dataMax ? dataMax : weekRange.end;
      const hasData = await checkDataFn(weekRange.start, adjustedEnd);
      if (hasData) {
        return {
          start: weekRange.start,
          end: adjustedEnd,
          hasCurrentWeekData: false
        };
      }
    }

    // Move to previous week
    checkDate.setDate(checkDate.getDate() - 7);
  }

  return null;
}
