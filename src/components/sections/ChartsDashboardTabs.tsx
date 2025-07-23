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
import { getChartColors } from "@/lib/utils/chartColors";

// Dynamic imports for all chart components
const CostAnalysisChart = dynamic(
  () =>
    import("@/components/charts/CostAnalysisChart").then((mod) => ({
      default: mod.CostAnalysisChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const DailyCostTrendChart = dynamic(
  () =>
    import("@/components/charts/DailyCostTrendChart").then((mod) => ({
      default: mod.DailyCostTrendChart
    })),
  { loading: () => <ChartSkeleton height={400} />, ssr: false }
);

const GaugeChart = dynamic(
  () => import("@/components/charts/GaugeChart").then((mod) => ({ default: mod.GaugeChart })),
  { loading: () => <ChartSkeleton height={250} />, ssr: false }
);

const HistogramChart = dynamic(
  () =>
    import("@/components/charts/HistogramChart").then((mod) => ({ default: mod.HistogramChart })),
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
    import("@/components/charts/LanguageDistributionChart").then((mod) => ({
      default: mod.LanguageDistributionChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const PerformanceTrendsChart = dynamic(
  () =>
    import("@/components/charts/PerformanceTrendsChart").then((mod) => ({
      default: mod.PerformanceTrendsChart
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
    import("@/components/charts/SessionsByCountryChart").then((mod) => ({
      default: mod.SessionsByCountryChart
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const TopCategoriesChart = dynamic(
  () =>
    import("@/components/charts/TopCategoriesChart").then((mod) => ({
      default: mod.TopCategoriesChart
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
  const colors = getChartColors();
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
    // Only scroll to tabs if they're above the viewport or too far down
    if (tabsRef.current) {
      setTimeout(() => {
        const element = tabsRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const yOffset = -100; // Offset for fixed header

          // Only scroll if tabs are above viewport or more than 200px below viewport top
          if (rect.top < 0 || rect.top > 200) {
            const y = element.offsetTop + yOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth"
            });
          }
        }
      }, 50); // Reduced delay for faster response
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
        <TabsContent value="overview" className="space-y-6">
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
            {visibility.hasRatings && (
              <GaugeChart value={chartData.avg_rating} title="Average User Rating" />
            )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <h3 className="text-xl font-bold mb-4">Performance Trends</h3>
          <PerformanceTrendsChart
            data={{
              dates_labels: chartData.dates_labels,
              dates_values: chartData.dates_values,
              response_time_values: chartData.response_time_values
            }}
          />
          <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
        </TabsContent>

        {/* Geographic Tab - Conditional */}
        {(visibility.hasCountryData || visibility.hasLanguageData) && (
          <TabsContent value="geographic" className="space-y-6">
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
        <TabsContent value="cost" className="space-y-6">
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
        <TabsContent value="detailed" className="space-y-6">
          <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
