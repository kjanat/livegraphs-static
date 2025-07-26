/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
    import("@/components/charts/GaugeChartShadcn").then((mod) => ({
      default: mod.GaugeChartShadcn
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

/**
 * Displays a dashboard section with multiple chatbot analytics charts, including sentiment distribution, resolution status, average user rating, and sentiment trends over time.
 *
 * Renders charts based on the provided data and visibility settings. The average user rating gauge is shown only if ratings are enabled and available.
 *
 * @param chartData - Data used to populate the charts, including sentiment, resolution, ratings, and time series information
 * @param visibility - Controls which charts are visible, such as whether to display the ratings gauge
 *
 * @returns The rendered set of analytics charts for the dashboard
 */
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
            description="Customer satisfaction score"
            unit=""
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
