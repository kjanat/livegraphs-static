/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { type ReactElement } from "react";
import { CHART_VISIBILITY } from "@/lib/constants/ui";
import type { ChartData, Metrics } from "@/lib/types/session";

export interface ChartGroupConfig {
  id: string;
  title: string;
  subtitle: string;
  defaultExpanded?: boolean | ((visibility: ChartVisibility) => boolean);
  priority: "high" | "medium" | "low";
  // Function to determine if this group should be shown
  isVisible?: (visibility: ChartVisibility) => boolean;
  // Function to render the group's content
  renderContent: (props: ChartContentProps) => ReactElement;
}

export interface ChartVisibility {
  hasRatings: boolean;
  hasCountryData: boolean;
  hasLanguageData: boolean;
  hasSufficientData: boolean;
}

export interface ChartContentProps {
  chartData: ChartData;
  metrics: Metrics;
  visibility: ChartVisibility;
}

/**
 * Calculate visibility flags based on chart data
 */
export function calculateChartVisibility(
  chartData: ChartData,
  totalSessions: number
): ChartVisibility {
  return {
    hasRatings: chartData.avg_rating != null && chartData.avg_rating > 0,
    hasCountryData:
      chartData.country_labels &&
      chartData.country_labels.length > CHART_VISIBILITY.minCountriesForMap,
    hasLanguageData:
      chartData.language_labels &&
      chartData.language_labels.length > CHART_VISIBILITY.minLanguagesForChart,
    hasSufficientData: totalSessions >= CHART_VISIBILITY.minSessionsForAnalytics
  };
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
    renderContent: ({ chartData, visibility }) => {
      const { default: OverviewCharts } = require("./chart-groups/OverviewCharts");
      return <OverviewCharts chartData={chartData} visibility={visibility} />;
    }
  },
  {
    id: "performance",
    title: "Performance Trends",
    subtitle: "Activity patterns over time",
    defaultExpanded: (visibility) => visibility.hasSufficientData,
    priority: "high",
    renderContent: ({ chartData }) => {
      const { default: PerformanceCharts } = require("./chart-groups/PerformanceCharts");
      return <PerformanceCharts chartData={chartData} />;
    }
  },
  {
    id: "geographic",
    title: "Geographic & Language Analysis",
    subtitle: "User distribution across regions and languages",
    defaultExpanded: false,
    priority: "medium",
    isVisible: (visibility) => visibility.hasCountryData || visibility.hasLanguageData,
    renderContent: ({ chartData, visibility }) => {
      const { default: GeographicCharts } = require("./chart-groups/GeographicCharts");
      return <GeographicCharts chartData={chartData} visibility={visibility} />;
    }
  },
  {
    id: "cost",
    title: "Category & Cost Analysis",
    subtitle: "Conversation topics and operational costs",
    defaultExpanded: false,
    priority: "medium",
    renderContent: ({ chartData }) => {
      const { default: CostAnalysisCharts } = require("./chart-groups/CostAnalysisCharts");
      return <CostAnalysisCharts chartData={chartData} />;
    }
  },
  {
    id: "detailed",
    title: "Detailed Statistics",
    subtitle: "Distribution analysis and conversation patterns",
    defaultExpanded: false,
    priority: "low",
    renderContent: ({ chartData }) => {
      const { default: DetailedStatsCharts } = require("./chart-groups/DetailedStatsCharts");
      return <DetailedStatsCharts chartData={chartData} />;
    }
  }
];
