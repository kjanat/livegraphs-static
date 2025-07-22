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
    message_counts?: number[];
  };
}

export function DailyCostTrendChart({ data }: DailyCostTrendChartProps) {
  const colors = getChartColors();

  const datasets = [
    {
      label: "Daily Cost (€)",
      data: data.values,
      borderColor: colors.yellow,
      backgroundColor: hexToRgba(colors.yellow, 0.25),
      fill: true
    }
  ];

  // Add message count dataset if provided
  if (data.message_counts) {
    datasets.push({
      label: "Message Count",
      data: data.message_counts,
      borderColor: colors.blue,
      backgroundColor: hexToRgba(colors.blue, 0.25),
      fill: false,
      yAxisID: "y1"
    } as any);
  }

  const options: any = {
    scales: {
      y: {
        beginAtZero: true,
        position: "left" as const,
        title: {
          display: data.message_counts ? true : false,
          text: "Cost (€)"
        },
        ticks: {
          callback: (value: any) => `€${Number(value).toFixed(2)}`
        }
      }
    }
  };

  // Add right y-axis for message counts if provided
  if (data.message_counts) {
    options.scales.y1 = {
      type: "linear" as const,
      display: true,
      position: "right" as const,
      beginAtZero: true,
      title: {
        display: true,
        text: "Messages"
      },
      grid: {
        drawOnChartArea: false
      }
    };

    // Enable interaction mode for better tooltips
    options.interaction = {
      mode: "index" as const,
      intersect: false
    };
  }

  return (
    <MultiLineChart
      title="Daily Cost & Message Volume Trend"
      labels={data.dates}
      datasets={datasets}
      options={options}
    />
  );
}
