/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { getChartColors } from "@/lib/utils/chartColors";
import { AnalyticsChart } from "./AnalyticsChart";

interface SessionsByCountryChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function SessionsByCountryChart({ data }: SessionsByCountryChartProps) {
  const colors = getChartColors();

  return (
    <AnalyticsChart
      type="bar"
      title="Sessions by Country"
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "Sessions",
            data: data.values,
            backgroundColor: colors.blue
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
