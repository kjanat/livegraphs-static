/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface SentimentDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

const chartConfig = {
  sessions: {
    label: "Sessions"
  },
  positive: {
    label: "Positive",
    color: "var(--chart-3)" // green
  },
  negative: {
    label: "Negative",
    color: "var(--chart-1)" // red
  },
  neutral: {
    label: "Neutral",
    color: "var(--chart-2)" // yellow
  }
} satisfies ChartConfig;

export function SentimentDistributionChart({ data }: SentimentDistributionChartProps) {
  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("SentimentDistributionChart: labels and values arrays must have equal length");
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculation
  const _total = data.values.reduce((sum, val) => sum + (val ?? 0), 0);

  const chartData = data.labels
    .map((label, index) => ({
      sentiment: label.toLowerCase(),
      sessions: data.values[index] ?? 0,
      fill: `var(--color-${label.toLowerCase()})`
    }))
    .filter((item) => item.sessions > 0); // Filter out items with zero values

  const totalSessions = chartData.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription className="sr-only">
          Pie chart showing the distribution of positive, negative, and neutral sentiment in chatbot
          sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 overflow-visible">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground [&_svg]:overflow-visible mx-auto aspect-square overflow-visible"
        >
          <PieChart margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => {
                    const numValue = typeof value === "number" ? value : Number(value);
                    const percentage = ((numValue / totalSessions) * 100).toFixed(1);
                    return (
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground capitalize">{name}</span>
                        <span className="font-mono font-medium">
                          {value} sessions ({percentage}%)
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="sessions"
              label={(entry) => entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1)}
              nameKey="sentiment"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none text-center">
          {(() => {
            const positiveCount = chartData.find((d) => d.sentiment === "positive")?.sessions || 0;
            const totalCount = chartData.reduce((sum, item) => sum + item.sessions, 0);
            const positiveRate =
              totalCount > 0 ? ((positiveCount / totalCount) * 100).toFixed(1) : "0";
            return `${positiveRate}% positive sentiment across ${totalSessions.toLocaleString()} sessions`;
          })()}
        </div>
      </CardFooter>
    </Card>
  );
}
