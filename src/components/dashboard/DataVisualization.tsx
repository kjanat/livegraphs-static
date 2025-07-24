/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { lazy, Suspense, useState } from "react";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { InsightsSummary } from "@/components/InsightsSummary";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { Button } from "@/components/ui/button";
import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";
import { EnhancedMetricsDisplay } from "@/components/ui/MetricTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";

// Lazy load chart components for better performance
const ChartsDashboard = lazy(() =>
  import("@/components/sections/ChartsDashboard").then((m) => ({ default: m.ChartsDashboard }))
);

const ChartsDashboardTabs = lazy(() =>
  import("@/components/sections/ChartsDashboardTabs").then((m) => ({
    default: m.ChartsDashboardTabs
  }))
);

interface DataVisualizationProps {
  metrics: Metrics | null;
  chartData: ChartData | null;
  dateRange: DateRange | null;
  isLoadingData: boolean;
  totalSessions?: number;
}

export function DataVisualization({
  metrics,
  chartData,
  dateRange,
  isLoadingData,
  totalSessions
}: DataVisualizationProps) {
  const isMobile = useIsMobile();
  const [useTabView, setUseTabView] = useState(true);

  // Loading State
  if (isLoadingData && dateRange) {
    return (
      <EnhancedLoadingState
        stage={isMobile ? "charts" : "metrics"}
        totalSessions={totalSessions}
        className="mb-8"
      />
    );
  }

  // No data to display
  if (!metrics || !chartData || !dateRange) {
    return null;
  }

  // Mobile View
  if (isMobile) {
    return <MobileDashboard metrics={metrics} chartData={chartData} />;
  }

  // Desktop View
  return (
    <>
      {/* Metrics Display */}
      <EnhancedMetricsDisplay metrics={metrics as unknown as { [key: string]: string | number }} />

      {/* Data Quality Indicator */}
      <DataQualityIndicator
        metrics={metrics}
        totalSessions={metrics["Total Conversations"]}
        dateRange={dateRange}
        chartData={chartData}
      />

      {/* Insights Summary */}
      <InsightsSummary metrics={metrics} chartData={chartData} dateRange={dateRange} />

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUseTabView(!useTabView)}
          className="gap-2"
        >
          {useTabView ? "Switch to Expandable View" : "Switch to Tab View"}
        </Button>
      </div>

      {/* Charts - Conditional rendering based on view preference */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        {useTabView ? (
          <ChartsDashboardTabs metrics={metrics} chartData={chartData} />
        ) : (
          <ChartsDashboard metrics={metrics} chartData={chartData} />
        )}
      </Suspense>
    </>
  );
}
