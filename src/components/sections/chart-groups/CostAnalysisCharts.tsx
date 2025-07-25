/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";

const TopCategoriesChart = dynamic(
  () =>
    import("@/components/charts/TopCategoriesChartShadcn").then((mod) => ({
      default: mod.TopCategoriesChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const CostAnalysisChart = dynamic(
  () =>
    import("@/components/charts/CostAnalysisChartShadcn").then((mod) => ({
      default: mod.CostAnalysisChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const DailyCostTrendChart = dynamic(
  () =>
    import("@/components/charts/DailyCostTrendChartShadcn").then((mod) => ({
      default: mod.DailyCostTrendChartShadcn
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

interface CostAnalysisChartsProps {
  chartData: ChartData;
}

/**
 * Displays a set of cost analysis charts for chatbot conversation analytics.
 *
 * Renders top categories, category cost breakdown, and daily cost trend charts using the provided chart data.
 *
 * @param chartData - The analytics data used to populate the charts
 * @returns The rendered chart group component
 */
function CostAnalysisCharts({ chartData }: CostAnalysisChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TopCategoriesChart
          data={{
            labels: chartData.category_labels,
            values: chartData.category_values
          }}
        />
        <CostAnalysisChart data={chartData.category_costs} />
      </div>
      <DailyCostTrendChart
        data={{
          dates: chartData.cost_dates,
          values: chartData.cost_values,
          message_counts: chartData.daily_message_counts
        }}
      />
    </div>
  );
}

export default memo(CostAnalysisCharts);
