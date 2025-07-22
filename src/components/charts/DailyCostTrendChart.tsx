/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { getChartColors, hexToRgba } from "@/lib/utils/chartColors";
import { MultiLineChart } from "./MultiLineChart";

interface DailyCostTrendChartProps {
  data: {
    dates: string[];
    values: number[];
  };
}

export function DailyCostTrendChart({ data }: DailyCostTrendChartProps) {
  const colors = getChartColors();

  return (
    <MultiLineChart
      title="Daily Cost Trend"
      labels={data.dates}
      datasets={[
        {
          label: "Daily Cost (€)",
          data: data.values,
          borderColor: colors.yellow,
          backgroundColor: hexToRgba(colors.yellow, 0.25),
          fill: true
        }
      ]}
      options={{
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `€${Number(value).toFixed(2)}`
            }
          }
        }
      }}
    />
  );
}
