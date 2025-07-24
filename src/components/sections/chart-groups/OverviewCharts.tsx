/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use memo"; // React Compiler directive for automatic optimization

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";
import type { ChartVisibility } from "../chartConfig";

const SentimentDistributionChart = dynamic(
  () =>
    import("@/components/charts/SentimentDistributionChart").then((mod) => ({
      default: mod.SentimentDistributionChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const ResolutionStatusChart = dynamic(
  () =>
    import("@/components/charts/ResolutionStatusChart").then((mod) => ({
      default: mod.ResolutionStatusChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const GaugeChart = dynamic(
  () =>
    import("@/components/charts/GaugeChartCircular").then((mod) => ({
      default: mod.GaugeChartCircular
    })),
  { loading: () => <ChartSkeleton height={250} />, ssr: false }
);

const PerformanceTrendsChart = dynamic(
  () =>
    import("@/components/charts/PerformanceTrendsShadcn").then((mod) => ({
      default: mod.PerformanceTrendsShadcn
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

interface OverviewChartsProps {
  chartData: ChartData;
  visibility: ChartVisibility;
}

function OverviewCharts({ chartData, visibility }: OverviewChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SentimentDistributionChart
          data={{
            labels: chartData.sentiment_labels,
            values: chartData.sentiment_values
          }}
        />
        <ResolutionStatusChart
          data={{
            labels: chartData.resolution_labels,
            values: chartData.resolution_values
          }}
        />
        {visibility.hasRatings && chartData.avg_rating !== null && (
          <GaugeChart
            value={chartData.avg_rating}
            max={5}
            title="Average User Rating"
            subtitle="Customer satisfaction score"
            formatValue={(val) => val.toFixed(1)}
            segments={[
              { threshold: 20, color: "rgb(239, 68, 68)", label: "Poor" },
              { threshold: 40, color: "rgb(251, 146, 60)", label: "Fair" },
              { threshold: 60, color: "rgb(250, 204, 21)", label: "Good" },
              { threshold: 80, color: "rgb(34, 197, 94)", label: "Very Good" },
              { threshold: 100, color: "rgb(16, 185, 129)", label: "Excellent" }
            ]}
          />
        )}
      </div>
      {/* Sentiment Trends Over Time */}
      <div className="mt-6">
        <PerformanceTrendsChart data={chartData.sentiment_time_series} />
      </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders when props haven't changed
export default memo(OverviewCharts);
