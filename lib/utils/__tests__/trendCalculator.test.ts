/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import type { ChartData } from "@/lib/types/session";
import { calculateMetricTrends, formatTrendText } from "../trendCalculator";

describe("trendCalculator", () => {
  describe("calculateMetricTrends", () => {
    it("should calculate week-over-week trends correctly", () => {
      const chartData: Partial<ChartData> = {
        dates_labels: [
          "2024-01-01",
          "2024-01-02",
          "2024-01-03",
          "2024-01-04",
          "2024-01-05",
          "2024-01-06",
          "2024-01-07",
          "2024-01-08",
          "2024-01-09",
          "2024-01-10",
          "2024-01-11",
          "2024-01-12",
          "2024-01-13",
          "2024-01-14"
        ],
        dates_values: [10, 12, 15, 13, 14, 16, 18, 20, 22, 25, 23, 24, 26, 28],
        response_time_dates: [
          "2024-01-01",
          "2024-01-02",
          "2024-01-03",
          "2024-01-04",
          "2024-01-05",
          "2024-01-06",
          "2024-01-07",
          "2024-01-08",
          "2024-01-09",
          "2024-01-10",
          "2024-01-11",
          "2024-01-12",
          "2024-01-13",
          "2024-01-14"
        ],
        response_time_values: [
          5.0, 4.8, 4.6, 4.5, 4.4, 4.3, 4.2, 4.0, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2
        ],
        cost_dates: [
          "2024-01-01",
          "2024-01-02",
          "2024-01-03",
          "2024-01-04",
          "2024-01-05",
          "2024-01-06",
          "2024-01-07",
          "2024-01-08",
          "2024-01-09",
          "2024-01-10",
          "2024-01-11",
          "2024-01-12",
          "2024-01-13",
          "2024-01-14"
        ],
        cost_values: [50, 52, 55, 53, 54, 56, 58, 60, 62, 65, 63, 64, 66, 68]
      };

      const trends = calculateMetricTrends(chartData as ChartData, true);

      // Total conversations should increase (week 2 sum > week 1 sum)
      expect(trends.totalConversations).toBeDefined();
      expect(trends.totalConversations?.isPositive).toBe(true);
      expect(trends.totalConversations?.value).toBeGreaterThan(0);

      // Response time should decrease (lower is better, so isPositive should be true)
      expect(trends.responseTime).toBeDefined();
      expect(trends.responseTime?.isPositive).toBe(true);
      expect(trends.responseTime?.value).toBeGreaterThan(0);

      // Daily cost should increase
      expect(trends.dailyCost).toBeDefined();
      expect(trends.dailyCost?.isPositive).toBe(true);
      expect(trends.dailyCost?.value).toBeGreaterThan(0);
    });

    it("should calculate day-over-day trends correctly", () => {
      const chartData: Partial<ChartData> = {
        dates_labels: ["2024-01-13", "2024-01-14"],
        dates_values: [26, 28],
        response_time_dates: ["2024-01-13", "2024-01-14"],
        response_time_values: [3.3, 3.2],
        cost_dates: ["2024-01-13", "2024-01-14"],
        cost_values: [66, 68]
      };

      const trends = calculateMetricTrends(chartData as ChartData, false);

      // Total conversations increased from 26 to 28
      expect(trends.totalConversations).toBeDefined();
      expect(trends.totalConversations?.isPositive).toBe(true);
      expect(trends.totalConversations?.value).toBe(8); // ~7.7% rounded

      // Response time decreased from 3.3 to 3.2 (improvement)
      expect(trends.responseTime).toBeDefined();
      expect(trends.responseTime?.isPositive).toBe(true);
      expect(trends.responseTime?.value).toBe(3); // ~3% improvement

      // Cost increased from 66 to 68
      expect(trends.dailyCost).toBeDefined();
      expect(trends.dailyCost?.isPositive).toBe(true);
      expect(trends.dailyCost?.value).toBe(3); // ~3% increase
    });

    it("should handle insufficient data gracefully", () => {
      const chartData: Partial<ChartData> = {
        dates_labels: ["2024-01-14"],
        dates_values: [28],
        response_time_dates: [],
        response_time_values: [],
        cost_dates: ["2024-01-13", "2024-01-14"],
        cost_values: [66, 68]
      };

      const trends = calculateMetricTrends(chartData as ChartData, true);

      // Not enough data for week-over-week
      expect(trends.totalConversations).toBeUndefined();

      // No response time data
      expect(trends.responseTime).toBeUndefined();

      // Not enough cost data for week-over-week
      expect(trends.dailyCost).toBeUndefined();
    });

    it("should handle zero previous values correctly", () => {
      const chartData: Partial<ChartData> = {
        dates_labels: ["2024-01-13", "2024-01-14"],
        dates_values: [0, 10],
        response_time_dates: ["2024-01-13", "2024-01-14"],
        response_time_values: [0, 5.0],
        cost_dates: ["2024-01-13", "2024-01-14"],
        cost_values: [0, 50]
      };

      const trends = calculateMetricTrends(chartData as ChartData, false);

      // From 0 to 10 should be 100% increase
      expect(trends.totalConversations).toBeDefined();
      expect(trends.totalConversations?.isPositive).toBe(true);
      expect(trends.totalConversations?.value).toBe(100);

      // Response time from 0 to 5 is technically an increase (bad)
      expect(trends.responseTime).toBeDefined();
      expect(trends.responseTime?.isPositive).toBe(false);
      expect(trends.responseTime?.value).toBe(100);

      // Cost from 0 to 50 should be 100% increase
      expect(trends.dailyCost).toBeDefined();
      expect(trends.dailyCost?.isPositive).toBe(true);
      expect(trends.dailyCost?.value).toBe(100);
    });
  });

  describe("formatTrendText", () => {
    it("should format positive trends correctly", () => {
      const trend = { value: 25, isPositive: true };
      expect(formatTrendText(trend, "totalConversations")).toBe("↑ +25%");
    });

    it("should format negative trends correctly", () => {
      const trend = { value: 15, isPositive: false };
      expect(formatTrendText(trend, "totalConversations")).toBe("↓ -15%");
    });

    it("should handle undefined trends", () => {
      expect(formatTrendText(undefined, "totalConversations")).toBe("");
    });

    it("should format trends for metrics where decrease is good", () => {
      const trend = { value: 10, isPositive: false };
      // For response time, a decrease (isPositive: false in raw calculation)
      // is inverted to isPositive: true in calculateMetricTrends
      expect(formatTrendText(trend, "responseTime")).toBe("↓ -10%");
    });
  });
});
