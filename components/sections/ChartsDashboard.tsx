/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useMemo } from "react";
import { CostAnalysisChart } from "@/components/charts/CostAnalysisChart";
import { DailyCostTrendChart } from "@/components/charts/DailyCostTrendChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { HistogramChart } from "@/components/charts/HistogramChart";
import { InteractiveHeatmap } from "@/components/charts/InteractiveHeatmap";
import { LanguageDistributionChart } from "@/components/charts/LanguageDistributionChart";
import { PerformanceTrendsChart } from "@/components/charts/PerformanceTrendsChart";
import { ResolutionStatusChart } from "@/components/charts/ResolutionStatusChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { SessionsByCountryChart } from "@/components/charts/SessionsByCountryChart";
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart";
import { TopQuestionsSection } from "@/components/charts/TopQuestionsSection";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { CHART_VISIBILITY } from "@/lib/constants/ui";
import type { ChartData, Metrics } from "@/lib/types/session";
import { getChartColors } from "@/lib/utils/chartColors";

interface ChartsDashboardProps {
  metrics: Metrics;
  chartData: ChartData;
}

interface ChartVisibility {
  hasRatings: boolean;
  hasCountryData: boolean;
  hasLanguageData: boolean;
  hasSufficientData: boolean;
}

export function ChartsDashboard({ metrics, chartData }: ChartsDashboardProps) {
  const colors = getChartColors();
  const totalSessions = metrics["Total Conversations"] || 0;

  // Memoize chart visibility calculations
  const visibility = useMemo<ChartVisibility>(
    () => ({
      hasRatings: chartData.avg_rating != null && chartData.avg_rating > 0,
      hasCountryData:
        chartData.country_labels &&
        chartData.country_labels.length > CHART_VISIBILITY.minCountriesForMap,
      hasLanguageData:
        chartData.language_labels &&
        chartData.language_labels.length > CHART_VISIBILITY.minLanguagesForChart,
      hasSufficientData: totalSessions >= CHART_VISIBILITY.minSessionsForAnalytics
    }),
    [chartData, totalSessions]
  );

  return (
    <div className="space-y-6">
      {/* Essential Overview - Always visible */}
      <ExpandableSection
        title="Essential Overview"
        subtitle="Key performance indicators and user satisfaction"
        defaultExpanded={true}
        priority="high"
      >
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
          {visibility.hasRatings && (
            <GaugeChart value={chartData.avg_rating} title="Average User Rating" />
          )}
        </div>
      </ExpandableSection>

      {/* Performance Trends - Expanded by default if sufficient data */}
      <ExpandableSection
        title="Performance Trends"
        subtitle="Response times and activity patterns over time"
        defaultExpanded={visibility.hasSufficientData}
        priority="high"
      >
        <div className="space-y-6">
          <PerformanceTrendsChart
            data={{
              dates_labels: chartData.dates_labels,
              dates_values: chartData.dates_values,
              response_time_values: chartData.response_time_values
            }}
          />
          <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
        </div>
      </ExpandableSection>

      {/* Geographic & Language Analysis - Only show if diverse data */}
      {(visibility.hasCountryData || visibility.hasLanguageData) && (
        <ExpandableSection
          title="Geographic & Language Analysis"
          subtitle="User distribution across regions and languages"
          defaultExpanded={false}
          priority="medium"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {visibility.hasCountryData && (
              <SessionsByCountryChart
                data={{
                  labels: chartData.country_labels,
                  values: chartData.country_values
                }}
              />
            )}
            {visibility.hasLanguageData && (
              <LanguageDistributionChart
                data={{
                  labels: chartData.language_labels,
                  values: chartData.language_values
                }}
              />
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Category & Cost Analysis */}
      <ExpandableSection
        title="Category & Cost Analysis"
        subtitle="Conversation topics and operational costs"
        defaultExpanded={false}
        priority="medium"
      >
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
              values: chartData.cost_values
            }}
          />
        </div>
      </ExpandableSection>

      {/* Detailed Statistics - Advanced users only */}
      <ExpandableSection
        title="Detailed Statistics"
        subtitle="Distribution analysis and conversation patterns"
        defaultExpanded={false}
        priority="low"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <HistogramChart
              data={chartData.conversation_durations}
              title="Conversation Duration Distribution"
              xLabel="Duration (minutes)"
              bins={15}
              color={colors.teal}
            />
            <HistogramChart
              data={chartData.messages_per_conversation}
              title="Messages per Conversation"
              xLabel="Number of Messages"
              bins={10}
              color={colors.pink}
            />
          </div>
          <TopQuestionsSection
            data={{
              labels: chartData.questions_labels,
              values: chartData.questions_values
            }}
          />
        </div>
      </ExpandableSection>
    </div>
  );
}
