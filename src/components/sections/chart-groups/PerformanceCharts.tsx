/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";

const InteractiveHeatmap = dynamic(
  () =>
    import("@/components/charts/InteractiveHeatmap").then((mod) => ({
      default: mod.InteractiveHeatmap
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

const PerformanceTrendsChart = dynamic(
  () =>
    import("@/components/charts/PerformanceTrendsShadcn").then((mod) => ({
      default: mod.PerformanceTrendsShadcn
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

interface PerformanceChartsProps {
  chartData: ChartData;
}

function PerformanceCharts({ chartData }: PerformanceChartsProps) {
  return (
    <div className="space-y-6">
      <PerformanceTrendsChart data={chartData.sentiment_time_series} />
      <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
    </div>
  );
}

export default memo(PerformanceCharts);
