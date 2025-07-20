/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { getChartColors } from "@/lib/utils/chartColors";
import { AnalyticsChart } from "./AnalyticsChart";

interface TopCategoriesChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  limit?: number;
}

export function TopCategoriesChart({ data, limit = 8 }: TopCategoriesChartProps) {
  const colors = getChartColors();

  return (
    <AnalyticsChart
      type="bar"
      title="Top Categories"
      data={{
        labels: data.labels.slice(0, limit),
        datasets: [
          {
            label: "Sessions",
            data: data.values.slice(0, limit),
            backgroundColor: colors.purple
          }
        ]
      }}
      options={{
        indexAxis: "y" as const,
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }}
    />
  );
}
