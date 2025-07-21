/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ChartData } from "@/lib/types/session";

export interface TrendResult {
  value: number;
  isPositive: boolean;
}

interface TrendData {
  totalConversations?: TrendResult;
  responseTime?: TrendResult;
  dailyCost?: TrendResult;
  uniqueUsers?: TrendResult;
  resolutionRate?: TrendResult;
}

/**
 * Calculate week-over-week trend for a time series
 * @param dates Array of date strings (YYYY-MM-DD)
 * @param values Array of values corresponding to dates
 * @param aggregationType How to aggregate values (sum or average)
 * @returns Trend percentage and direction
 */
function calculateWeekOverWeekTrend(
  dates: string[],
  values: number[],
  aggregationType: "sum" | "average" = "sum"
): TrendResult | undefined {
  if (!dates || !values || dates.length !== values.length || dates.length < 7) {
    return undefined;
  }

  // Get the most recent date
  const mostRecentDate = new Date(dates[dates.length - 1]);
  const oneWeekAgo = new Date(mostRecentDate);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(mostRecentDate);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Split data into current week and previous week
  const currentWeekData: number[] = [];
  const previousWeekData: number[] = [];

  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    if (date > oneWeekAgo && date <= mostRecentDate) {
      currentWeekData.push(values[i]);
    } else if (date > twoWeeksAgo && date <= oneWeekAgo) {
      previousWeekData.push(values[i]);
    }
  }

  // Need at least 3 days in each week for meaningful comparison
  if (currentWeekData.length < 3 || previousWeekData.length < 3) {
    return undefined;
  }

  // Calculate aggregated values
  let currentValue: number;
  let previousValue: number;

  if (aggregationType === "sum") {
    currentValue = currentWeekData.reduce((sum, val) => sum + val, 0);
    previousValue = previousWeekData.reduce((sum, val) => sum + val, 0);
  } else {
    currentValue = currentWeekData.reduce((sum, val) => sum + val, 0) / currentWeekData.length;
    previousValue = previousWeekData.reduce((sum, val) => sum + val, 0) / previousWeekData.length;
  }

  if (previousValue === 0) {
    return currentValue > 0 ? { value: 100, isPositive: true } : undefined;
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

  return {
    value: Math.abs(Math.round(percentageChange)),
    isPositive: percentageChange >= 0
  };
}

/**
 * Calculate day-over-day trend for the most recent data
 * @param dates Array of date strings (YYYY-MM-DD)
 * @param values Array of values corresponding to dates
 * @returns Trend percentage and direction
 */
function calculateDayOverDayTrend(dates: string[], values: number[]): TrendResult | undefined {
  if (!dates || !values || dates.length < 2 || dates.length !== values.length) {
    return undefined;
  }

  const currentValue = values[values.length - 1];
  const previousValue = values[values.length - 2];

  if (previousValue === 0) {
    return currentValue > 0 ? { value: 100, isPositive: true } : undefined;
  }

  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

  return {
    value: Math.abs(Math.round(percentageChange)),
    isPositive: percentageChange >= 0
  };
}

/**
 * Calculate trends for all major metrics
 * @param chartData Chart data containing time series
 * @param useWeekOverWeek Whether to use week-over-week (true) or day-over-day (false) trends
 * @returns Object containing trend data for each metric
 */
export function calculateMetricTrends(chartData: ChartData, useWeekOverWeek = true): TrendData {
  const trends: TrendData = {};

  // Total Conversations trend
  if (chartData.dates_labels && chartData.dates_values) {
    trends.totalConversations = useWeekOverWeek
      ? calculateWeekOverWeekTrend(chartData.dates_labels, chartData.dates_values, "sum")
      : calculateDayOverDayTrend(chartData.dates_labels, chartData.dates_values);
  }

  // Response Time trend (lower is better, so invert the isPositive)
  if (chartData.response_time_dates && chartData.response_time_values) {
    const responseTrend = useWeekOverWeek
      ? calculateWeekOverWeekTrend(
          chartData.response_time_dates,
          chartData.response_time_values,
          "average"
        )
      : calculateDayOverDayTrend(chartData.response_time_dates, chartData.response_time_values);

    if (responseTrend) {
      // For response time, a decrease is positive
      trends.responseTime = {
        value: responseTrend.value,
        isPositive: !responseTrend.isPositive
      };
    }
  }

  // Daily Cost trend
  if (chartData.cost_dates && chartData.cost_values) {
    trends.dailyCost = useWeekOverWeek
      ? calculateWeekOverWeekTrend(chartData.cost_dates, chartData.cost_values, "average")
      : calculateDayOverDayTrend(chartData.cost_dates, chartData.cost_values);
  }

  // Resolution Rate trend (calculated from resolution values over time)
  // This would require additional data that tracks resolution rate by date
  // For now, we'll leave this as undefined unless we enhance the data processing

  return trends;
}

/**
 * Format trend value for display
 * @param trend The trend object
 * @param metric The metric type for context-specific formatting
 * @returns Formatted string for display
 */
export function formatTrendText(trend: TrendResult | undefined, metric: string): string {
  if (!trend) return "";

  const arrow = trend.isPositive ? "↑" : "↓";
  const prefix = trend.isPositive ? "+" : "-";

  return `${arrow} ${prefix}${trend.value}%`;
}
