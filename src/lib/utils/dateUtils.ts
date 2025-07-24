/**
 * Date utility functions
 */

import { endOfDay, startOfWeek } from "date-fns";

/**
 * Get the date range for the current working week (Monday to today)
 * If today is Sunday at 23:59.99999, you get almost 7 days of data
 * At Monday 00:00, it starts showing this week's data
 */
export function getWorkingWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  // Get the start of the week (Monday)
  const start = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday

  // End is today at end of day
  const end = endOfDay(now);

  return { start, end };
}

/**
 * Find the most recent working week that has data within the given date range
 * @param dataMin - Minimum date in the dataset
 * @param dataMax - Maximum date in the dataset
 * @param checkDataFn - Function to check if a date range has data
 */
export async function findRecentWorkingWeekWithData(
  dataMin: Date,
  dataMax: Date,
  checkDataFn: (start: Date, end: Date) => Promise<boolean>
): Promise<{ start: Date; end: Date; hasCurrentWeekData: boolean } | null> {
  const now = new Date();
  const currentWeekRange = getWorkingWeekRange(now);

  console.log("findRecentWorkingWeekWithData: Current week range", {
    start: currentWeekRange.start.toISOString(),
    end: currentWeekRange.end.toISOString(),
    dataMax: dataMax.toISOString()
  });

  // First check if current week has data
  // Adjust end date to not exceed dataMax
  const adjustedCurrentWeekEnd = currentWeekRange.end > dataMax ? dataMax : currentWeekRange.end;
  const hasCurrentWeekData = await checkDataFn(currentWeekRange.start, adjustedCurrentWeekEnd);

  console.log("findRecentWorkingWeekWithData: Current week has data?", hasCurrentWeekData);

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
