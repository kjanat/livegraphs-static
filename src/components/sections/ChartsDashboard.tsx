/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { CHART_VISIBILITY } from "@/lib/constants/ui";
import type { ChartData, Metrics } from "@/lib/types/session";

// Dynamic imports for all chart components
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

const GaugeChart = dynamic(
  () =>
    import("@/components/charts/GaugeChartCircular").then((mod) => ({
      default: mod.GaugeChartCircular
    })),
  { loading: () => <ChartSkeleton height={250} />, ssr: false }
);

const DistributionBarChart = dynamic(
  () =>
    import("@/components/charts/DistributionBarChart").then((mod) => ({
      default: mod.DistributionBarChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const InteractiveHeatmap = dynamic(
  () =>
    import("@/components/charts/InteractiveHeatmap").then((mod) => ({
      default: mod.InteractiveHeatmap
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

const LanguageDistributionChart = dynamic(
  () =>
    import("@/components/charts/LanguageDistributionChartShadcn").then((mod) => ({
      default: mod.LanguageDistributionChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const PerformanceTrendsChart = dynamic(
  () =>
    import("@/components/charts/PerformanceTrendsShadcn").then((mod) => ({
      default: mod.PerformanceTrendsShadcn
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

const ResolutionStatusChart = dynamic(
  () =>
    import("@/components/charts/ResolutionStatusChart").then((mod) => ({
      default: mod.ResolutionStatusChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const SentimentDistributionChart = dynamic(
  () =>
    import("@/components/charts/SentimentDistributionChart").then((mod) => ({
      default: mod.SentimentDistributionChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const SessionsByCountryChart = dynamic(
  () =>
    import("@/components/charts/SessionsByCountryChartShadcn").then((mod) => ({
      default: mod.SessionsByCountryChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const TopCategoriesChart = dynamic(
  () =>
    import("@/components/charts/TopCategoriesChartShadcn").then((mod) => ({
      default: mod.TopCategoriesChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const TopQuestionsSection = dynamic(
  () =>
    import("@/components/charts/TopQuestionsSection").then((mod) => ({
      default: mod.TopQuestionsSection
    })),
  { loading: () => <ChartSkeleton height={500} />, ssr: false }
);

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
      </ExpandableSection>

      {/* Performance Trends - Expanded by default if sufficient data */}
      <ExpandableSection
        title="Performance Trends"
        subtitle="Activity patterns over time"
        defaultExpanded={visibility.hasSufficientData}
        priority="high"
      >
        <div className="space-y-6">
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
              values: chartData.cost_values,
              message_counts: chartData.daily_message_counts
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
            <DistributionBarChart
              data={chartData.conversation_durations}
              title="Conversation Duration"
              description="How long customer conversations typically last"
              bins={8}
              color="hsl(var(--chart-3))"
              formatLabel={(value) => `${Math.round(value)}m`}
            />
            <DistributionBarChart
              data={chartData.messages_per_conversation}
              title="Messages per Conversation"
              description="Distribution of message exchanges in conversations"
              bins={8}
              color="hsl(var(--chart-4))"
              formatLabel={(value) => Math.round(value).toString()}
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
