/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type ComponentType, lazy, type ReactElement } from "react";
import { CHART_VISIBILITY } from "@/lib/constants/ui";
import type { ChartData, Metrics } from "@/lib/types/session";

// Lazy load chart group components
const OverviewCharts = lazy(() => import("./chart-groups/OverviewCharts"));
const PerformanceCharts = lazy(() => import("./chart-groups/PerformanceCharts"));
const GeographicCharts = lazy(() => import("./chart-groups/GeographicCharts"));
const CostAnalysisCharts = lazy(() => import("./chart-groups/CostAnalysisCharts"));
const DetailedStatsCharts = lazy(() => import("./chart-groups/DetailedStatsCharts"));

export interface ChartGroupConfig {
  id: string;
  title: string;
  subtitle: string;
  defaultExpanded?: boolean | ((visibility: ChartVisibility) => boolean);
  priority: "high" | "medium" | "low";
  // Function to determine if this group should be shown
  isVisible?: (visibility: ChartVisibility) => boolean;
  // Component to render for this group
  Component: ComponentType<ChartContentProps>;
}

export interface ChartVisibility {
  hasRatings: boolean;
  hasCountryData: boolean;
  hasLanguageData: boolean;
  hasSufficientData: boolean;
  // Cached group visibility to avoid repeated calculations
  groupVisibility?: Map<string, boolean>;
}

export interface ChartContentProps {
  chartData: ChartData;
  metrics: Metrics;
  visibility: ChartVisibility;
}

/**
 * Calculate visibility flags based on chart data
 * Optimized with early returns and cached group visibility
 */
export function calculateChartVisibility(
  chartData: ChartData,
  totalSessions: number
): ChartVisibility {
  // Early return for insufficient data
  const hasSufficientData = totalSessions >= CHART_VISIBILITY.minSessionsForAnalytics;

  // Compute basic visibility flags
  const hasRatings = chartData.avg_rating != null && chartData.avg_rating > 0;
  const hasCountryData =
    Array.isArray(chartData.country_labels) &&
    chartData.country_labels.length > CHART_VISIBILITY.minCountriesForMap;
  const hasLanguageData =
    Array.isArray(chartData.language_labels) &&
    chartData.language_labels.length > CHART_VISIBILITY.minLanguagesForChart;

  const visibility: ChartVisibility = {
    hasRatings,
    hasCountryData,
    hasLanguageData,
    hasSufficientData
  };

  // Pre-calculate group visibility for all groups
  const groupVisibility = new Map<string, boolean>();
  for (const group of CHART_GROUPS) {
    groupVisibility.set(group.id, !group.isVisible || group.isVisible(visibility));
  }
  visibility.groupVisibility = groupVisibility;

  return visibility;
}

/**
 * Chart group configurations define the structure and content of each section
 */
export const CHART_GROUPS: ChartGroupConfig[] = [
  {
    id: "overview",
    title: "Essential Overview",
    subtitle: "Key performance indicators and user satisfaction",
    defaultExpanded: true,
    priority: "high",
    Component: OverviewCharts
  },
  {
    id: "performance",
    title: "Performance Trends",
    subtitle: "Activity patterns over time",
    defaultExpanded: (visibility) => visibility.hasSufficientData,
    priority: "high",
    Component: PerformanceCharts
  },
  {
    id: "geographic",
    title: "Geographic & Language Analysis",
    subtitle: "User distribution across regions and languages",
    defaultExpanded: false,
    priority: "medium",
    isVisible: (visibility) => visibility.hasCountryData || visibility.hasLanguageData,
    Component: GeographicCharts
  },
  {
    id: "cost",
    title: "Category & Cost Analysis",
    subtitle: "Conversation topics and operational costs",
    defaultExpanded: false,
    priority: "medium",
    Component: CostAnalysisCharts
  },
  {
    id: "detailed",
    title: "Detailed Statistics",
    subtitle: "Distribution analysis and conversation patterns",
    defaultExpanded: false,
    priority: "low",
    Component: DetailedStatsCharts
  }
];

/**
 * Helper to get visible chart groups based on visibility flags
 * Optimized to use pre-calculated group visibility when available
 */
export function getVisibleGroups(visibility: ChartVisibility): ChartGroupConfig[] {
  // Use cached visibility if available for better performance
  if (visibility.groupVisibility) {
    return CHART_GROUPS.filter((group) => visibility.groupVisibility?.get(group.id) ?? true);
  }

  // Fallback to direct calculation
  return CHART_GROUPS.filter((group) => !group.isVisible || group.isVisible(visibility));
}

/**
 * Helper to check if a group should be expanded by default
 */
export function isGroupExpanded(group: ChartGroupConfig, visibility: ChartVisibility): boolean {
  if (typeof group.defaultExpanded === "function") {
    return group.defaultExpanded(visibility);
  }
  return group.defaultExpanded ?? false;
}
