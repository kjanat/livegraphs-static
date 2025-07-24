/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";

const DistributionBarChart = dynamic(
  () =>
    import("@/components/charts/DistributionBarChart").then((mod) => ({
      default: mod.DistributionBarChart
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

export default function DetailedStatsCharts({ chartData }: DetailedStatsChartsProps) {
  return (
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
  );
}
