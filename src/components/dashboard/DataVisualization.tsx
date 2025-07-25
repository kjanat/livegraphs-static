/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { InsightsSummary } from "@/components/InsightsSummary";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { Button } from "@/components/ui/button";
import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";
import { EnhancedMetricsDisplay } from "@/components/ui/MetricTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";

// Lazy load unified chart dashboard
const ChartsDashboardUnified = lazy(() =>
  import("@/components/sections/ChartsDashboardUnified").then((m) => ({
    default: m.ChartsDashboardUnified
  }))
);

const VIEW_MODE_STORAGE_KEY = "livegraphs_chart_view_mode";

interface DataVisualizationProps {
  metrics: Metrics | null;
  chartData: ChartData | null;
  dateRange: DateRange | null;
  isLoadingData: boolean;
  totalSessions?: number;
}

/**
 * Renders a responsive analytics dashboard for chatbot conversation data, adapting layout and features for mobile and desktop devices.
 *
 * Displays metrics, charts, data quality indicators, and insights summary based on the provided data and date range. On desktop, allows toggling between tabbed and expandable chart views, with user preference persisted across sessions. Shows loading states when data is being fetched and renders nothing if required data is missing.
 *
 * @param metrics - Aggregated metrics for the selected date range and chatbot
 * @param chartData - Data used to render analytics charts
 * @param dateRange - The date range for which analytics are displayed
 * @param isLoadingData - Whether analytics data is currently being loaded
 * @param totalSessions - Optional total number of chatbot sessions in the selected period
 * @returns The analytics dashboard UI or null if required data is unavailable
 */
export function DataVisualization({
  metrics,
  chartData,
  dateRange,
  isLoadingData,
  totalSessions
}: DataVisualizationProps) {
  const isMobile = useIsMobile();

  // Load view preference from localStorage with default to tabs
  const [viewMode, setViewMode] = useState<"tabs" | "expandable">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return saved === "expandable" ? "expandable" : "tabs";
    }
    return "tabs";
  });

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "tabs" ? "expandable" : "tabs"));
  };

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
        <Button variant="outline" size="sm" onClick={toggleViewMode} className="gap-2">
          {viewMode === "tabs" ? "Switch to Expandable View" : "Switch to Tab View"}
        </Button>
      </div>

      {/* Charts - Unified component with view mode */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <ChartsDashboardUnified metrics={metrics} chartData={chartData} viewMode={viewMode} />
      </Suspense>
    </>
  );
}
