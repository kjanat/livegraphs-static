/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";

const HistogramChart = dynamic(
  () =>
    import("@/components/charts/HistogramChartShadcn").then((mod) => ({
      default: mod.HistogramChartShadcn
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

interface DetailedStatsChartsProps {
  chartData: ChartData;
}

/**
 * Displays detailed analytics charts for chatbot conversations, including distributions of conversation durations, messages per conversation, and top questions.
 *
 * Renders two bar charts side-by-side for conversation durations and message counts, followed by a section highlighting the most frequently asked questions.
 *
 * @param chartData - The analytics data used to populate the charts and top questions section.
 */
function DetailedStatsCharts({ chartData }: DetailedStatsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <HistogramChart
          data={chartData.conversation_durations}
          title="Conversation Duration"
          bins={8}
        />
        <HistogramChart
          data={chartData.messages_per_conversation}
          title="Messages per Conversation"
          bins={8}
        />
      </div>
      <TopQuestionsSection
        data={{
          labels: chartData.questions_labels,
          values: chartData.questions_values
        }}
      />
    </div>
  );
}

export default memo(DetailedStatsCharts);
