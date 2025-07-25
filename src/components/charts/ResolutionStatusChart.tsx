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

interface ResolutionStatusChartProps {
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
  resolved: {
    label: "Resolved",
    theme: {
      light: "hsl(142.1 76.2% 36.3%)",
      dark: "hsl(142.1 70.6% 45.3%)"
    }
  },
  escalated: {
    label: "Escalated",
    theme: {
      light: "hsl(346.8 77.2% 49.8%)",
      dark: "hsl(346.8 77.2% 49.8%)"
    }
  },
  unresolved: {
    label: "Unresolved",
    theme: {
      light: "hsl(220.9 39.3% 11%)",
      dark: "hsl(215 20.2% 65.1%)"
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
 * Displays a pie chart summarizing chatbot session resolution statuses, including resolved, escalated, and unresolved sessions.
 *
 * Validates input data, computes totals, and renders an interactive chart with tooltips, optional legend, and a central resolution rate label. Shows an error message if data is invalid.
 *
 * @param data - Object containing `labels` (status names) and `values` (session counts) arrays of equal length.
 * @param showLegend - If true, displays a legend for the chart (default: false).
 * @param enableAnimation - If true, enables chart animation (default: true).
 * @returns A card component containing the resolution status pie chart or an error message if data is invalid.
 */
export function ResolutionStatusChart({
  data,
  showLegend = false,
  enableAnimation = true
}: ResolutionStatusChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("ResolutionStatusChart: labels and values arrays must have equal length");
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
        </CardContent>
      </Card>
    );
  }

  // Create chart data with safe mapping to prevent undefined values
  const maxLength = Math.min(data.labels.length, data.values.length);
  const chartData = data.labels
    .slice(0, maxLength)
    .map((label, index) => ({
      status: label.toLowerCase(),
      sessions: data.values[index] ?? 0,
      fill: `var(--color-${label.toLowerCase()})`
    }))
    .filter((item) => item.sessions > 0); // Filter out items with zero values

  const totalSessions = chartData.reduce((sum, item) => sum + item.sessions, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Resolution Status</CardTitle>
        <CardDescription>Session outcomes and escalation tracking</CardDescription>
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
              nameKey="status"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              animationBegin={0}
              animationDuration={enableAnimation ? 500 : 0}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const resolvedCount =
                      chartData.find((d) => d.status === "resolved")?.sessions || 0;
                    const resolutionRate =
                      totalSessions > 0 ? ((resolvedCount / totalSessions) * 100).toFixed(0) : "0";
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
                          {resolutionRate}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Resolved
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
            const escalatedCount = chartData.find((d) => d.status === "escalated")?.sessions || 0;
            const unresolvedCount = chartData.find((d) => d.status === "unresolved")?.sessions || 0;
            return `${escalatedCount.toLocaleString()} escalated • ${unresolvedCount.toLocaleString()} pending`;
          })()}
        </div>
      </CardFooter>
    </Card>
  );
}
