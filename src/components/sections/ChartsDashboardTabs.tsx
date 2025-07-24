/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ChartsDashboardTabsProps {
  metrics: Metrics;
  chartData: ChartData;
}

interface ChartVisibility {
  hasRatings: boolean;
  hasCountryData: boolean;
  hasLanguageData: boolean;
  hasSufficientData: boolean;
}

export function ChartsDashboardTabs({ metrics, chartData }: ChartsDashboardTabsProps) {
  const totalSessions = metrics["Total Conversations"] || 0;
  const tabsRef = useRef<HTMLDivElement>(null);

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

  const handleTabChange = () => {
    // Use requestAnimationFrame to ensure layout is stable before scrolling
    if (tabsRef.current) {
      // Double RAF to ensure all layout shifts have occurred
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = tabsRef.current;
          if (element) {
            const yOffset = -100; // Offset for fixed header
            const y = element.offsetTop + yOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth"
            });
          }
        });
      });
    }
  };

  return (
    <div ref={tabsRef}>
      <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
        <div className="relative w-full">
          <div className="w-full overflow-x-auto scrollbar-none lg:overflow-visible">
            <TabsList className="inline-flex h-10 min-w-full items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground lg:grid lg:w-full lg:grid-cols-5">
              <TabsTrigger value="overview" className="min-w-[120px] whitespace-nowrap lg:min-w-0">
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="min-w-[120px] whitespace-nowrap lg:min-w-0"
              >
                Performance
              </TabsTrigger>
              {(visibility.hasCountryData || visibility.hasLanguageData) && (
                <TabsTrigger
                  value="geographic"
                  className="min-w-[120px] whitespace-nowrap lg:min-w-0"
                >
                  Geographic
                </TabsTrigger>
              )}
              <TabsTrigger value="cost" className="min-w-[120px] whitespace-nowrap lg:min-w-0">
                Cost Analysis
              </TabsTrigger>
              <TabsTrigger value="detailed" className="min-w-[120px] whitespace-nowrap lg:min-w-0">
                Detailed Stats
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Scroll indicator for mobile/tablet */}
          <div className="absolute right-0 top-0 h-10 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 min-h-[400px]">
          <h3 className="text-xl font-bold mb-4">Essential Overview</h3>
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
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 min-h-[600px]">
          <h3 className="text-xl font-bold mb-4">Performance Trends</h3>
          <PerformanceTrendsChart data={chartData.sentiment_time_series} />
          <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
        </TabsContent>

        {/* Geographic Tab - Conditional */}
        {(visibility.hasCountryData || visibility.hasLanguageData) && (
          <TabsContent value="geographic" className="space-y-6 min-h-[400px]">
            <h3 className="text-xl font-bold mb-4">Geographic & Language Analysis</h3>
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
          </TabsContent>
        )}

        {/* Cost Analysis Tab */}
        <TabsContent value="cost" className="space-y-6 min-h-[600px]">
          <h3 className="text-xl font-bold mb-4">Category & Cost Analysis</h3>
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
        </TabsContent>

        {/* Detailed Statistics Tab */}
        <TabsContent value="detailed" className="space-y-6 min-h-[600px]">
          <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
