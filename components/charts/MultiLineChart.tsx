/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { setupCharts } from "./ChartConfig";

setupCharts();

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor?: string;
  yAxisID?: string;
  fill?: boolean;
}

interface MultiLineChartProps {
  labels: string[];
  datasets: Dataset[];
  title?: string;
  options?: ChartOptions<"line">;
}

export function MultiLineChart({
  labels,
  datasets,
  title = "Trends Over Time",
  options: customOptions
}: MultiLineChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: dataset.borderColor,
      pointBorderColor: "#fff",
      pointBorderWidth: 2
    }))
  };

  const defaultOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      }
    }
  };

  const options = customOptions || defaultOptions;

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
      <div className="relative h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
