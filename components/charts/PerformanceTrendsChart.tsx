/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { getChartColors, hexToRgba } from "@/lib/utils/chartColors";
import { MultiLineChart } from "./MultiLineChart";

interface PerformanceTrendsChartProps {
  data: {
    dates_labels: string[];
    dates_values: number[];
    response_time_values: number[];
  };
}

export function PerformanceTrendsChart({ data }: PerformanceTrendsChartProps) {
  const colors = getChartColors();

  return (
    <MultiLineChart
      title="Performance Trends Over Time"
      labels={data.dates_labels}
      datasets={[
        {
          label: "Sessions",
          data: data.dates_values,
          borderColor: colors.blue,
          backgroundColor: hexToRgba(colors.blue, 0.25),
          fill: true
        },
        {
          label: "Avg Response Time (sec)",
          data: data.response_time_values,
          borderColor: colors.yellow,
          yAxisID: "y1"
        }
      ]}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index" as const,
          intersect: false
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            type: "linear" as const,
            display: true,
            position: "left" as const,
            title: {
              display: true,
              text: "Number of Sessions"
            }
          },
          y1: {
            type: "linear" as const,
            display: true,
            position: "right" as const,
            title: {
              display: true,
              text: "Response Time (sec)"
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }}
    />
  );
}
