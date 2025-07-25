/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";
import { Cell, Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface SentimentDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  showLegend?: boolean;
  enableAnimation?: boolean;
}

const chartConfig = {
  sessions: {
    label: "Sessions"
  },
  positive: {
    label: "Positive",
    theme: {
      light: "hsl(142.1 76.2% 36.3%)",
      dark: "hsl(142.1 70.6% 45.3%)"
    }
  },
  negative: {
    label: "Negative",
    theme: {
      light: "hsl(346.8 77.2% 49.8%)",
      dark: "hsl(346.8 77.2% 49.8%)"
    }
  },
  neutral: {
    label: "Neutral",
    theme: {
      light: "hsl(37.7 92.1% 50.2%)",
      dark: "hsl(45.4 93.4% 47.9%)"
    }
  }
} satisfies ChartConfig;

// Custom active shape renderer for enhanced hover effect
const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius ? outerRadius + 6 : 0}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

/**
 * Renders a pie chart visualizing the distribution of customer sentiment across chatbot sessions.
 *
 * Displays sentiment categories as colored sectors, with interactive highlighting, tooltips showing session counts and percentages, and an optional legend. The chart is wrapped in a card layout with a header, content, and a footer summarizing the positive sentiment rate. If input data is invalid, an error message is shown instead.
 *
 * @param data - Object containing `labels` (sentiment categories) and `values` (session counts) arrays of equal length
 * @param showLegend - Whether to display the chart legend (default: false)
 * @param enableAnimation - Whether to animate the chart transitions (default: true)
 * @returns A card component containing the sentiment distribution pie chart or an error message if data is invalid
 */
export function SentimentDistributionChart({
  data,
  showLegend = false,
  enableAnimation = true
}: SentimentDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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
        <CardDescription>Distribution of customer sentiment across all sessions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart accessibilityLayer>
            <ChartTooltip
              cursor={false}
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
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="sessions"
              nameKey="sentiment"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              animationBegin={0}
              animationDuration={enableAnimation ? 500 : 0}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.sentiment}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalSessions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Sessions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            {showLegend && (
              <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2" />
            )}
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
            return `${positiveRate}% positive sentiment`;
          })()}
        </div>
      </CardFooter>
    </Card>
  );
}
