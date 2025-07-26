/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import "chartjs-adapter-date-fns";
import { memo, useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useChartSetup } from "@/hooks/useChartSetup";
import type { ChartJsProps } from "@/lib/types/charts";
import { ChartWrapper } from "./ChartWrapper";

type SupportedChartType = "doughnut" | "bar" | "line";

interface AnalyticsChartProps extends ChartJsProps<SupportedChartType> {
  type: SupportedChartType;
  title: string;
}

const ChartComponents = {
  doughnut: Doughnut,
  bar: Bar,
  line: Line
} as const;

export const AnalyticsChart = memo(({ type, data, options, title }: AnalyticsChartProps) => {
  useChartSetup();
  const isEmpty = useMemo(
    () => !data.datasets || data.datasets.length === 0 || data.datasets[0].data.length === 0,
    [data]
  );

  const renderChart = () => {
    switch (type) {
      case "doughnut":
        return <Doughnut data={data as any} options={options as any} />;
      case "bar":
        return <Bar data={data as any} options={options as any} />;
      case "line":
        return <Line data={data as any} options={options as any} />;
      default:
        return null;
    }
  };

  return (
    <ChartWrapper title={title} isEmpty={isEmpty} contentClassName="relative h-96">
      {renderChart()}
    </ChartWrapper>
  );
});

AnalyticsChart.displayName = "AnalyticsChart";
