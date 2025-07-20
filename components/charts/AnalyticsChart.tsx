/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import "chartjs-adapter-date-fns";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  type ChartData,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip
} from "chart.js";
import { memo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register all necessary Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale
);

type ChartType = "doughnut" | "bar" | "line";

interface AnalyticsChartProps {
  type: ChartType;
  data: ChartData<ChartType>;
  options?: ChartOptions<ChartType>;
  title: string;
}

const ChartComponent = <T extends ChartType>({
  type,
  data,
  options
}: {
  type: T;
  data: ChartData<T>;
  options?: ChartOptions<T>;
}) => {
  switch (type) {
    case "doughnut":
      return (
        <Doughnut
          data={data as ChartData<"doughnut">}
          options={options as ChartOptions<"doughnut">}
        />
      );
    case "bar":
      return <Bar data={data as ChartData<"bar">} options={options as ChartOptions<"bar">} />;
    case "line":
      return <Line data={data as ChartData<"line">} options={options as ChartOptions<"line">} />;
    default:
      return null;
  }
};

export const AnalyticsChart = memo(({ type, data, options, title }: AnalyticsChartProps) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
      <div className="relative h-96">
        <ChartComponent type={type} data={data} options={options} />
      </div>
    </div>
  );
});

AnalyticsChart.displayName = "AnalyticsChart";
