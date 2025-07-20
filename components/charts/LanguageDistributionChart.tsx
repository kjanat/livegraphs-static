/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { getChartColors } from "@/lib/utils/chartColors";
import { AnalyticsChart } from "./AnalyticsChart";

interface LanguageDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  const colors = getChartColors();

  return (
    <AnalyticsChart
      type="bar"
      title="Language Distribution"
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "Sessions",
            data: data.values,
            backgroundColor: colors.green
          }
        ]
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }}
    />
  );
}
