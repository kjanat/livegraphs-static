/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { DateRange } from "react-day-picker";

export interface DateRangePreset {
  label: string;
  shortLabel: string;
  value: (dateRange?: { min: string; max: string }) => DateRange;
}

/**
 * Factory function to create date range presets
 */
export function createDateRangePresets(dateRange?: {
  min: string;
  max: string;
}): DateRangePreset[] {
  return [
    {
      label: "All Data",
      shortLabel: "All",
      value: () => {
        if (!dateRange) {
          const now = new Date();
          return { from: now, to: now };
        }
        const min = new Date(dateRange.min);
        const max = new Date(dateRange.max);
        return { from: min, to: max };
      }
    },
    {
      label: "Last 7 Days",
      shortLabel: "7D",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { from: start, to: end };
      }
    },
    {
      label: "Last 30 Days",
      shortLabel: "30D",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { from: start, to: end };
      }
    },
    {
      label: "Last 3 Months",
      shortLabel: "3M",
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        return { from: start, to: end };
      }
    }
  ];
}
