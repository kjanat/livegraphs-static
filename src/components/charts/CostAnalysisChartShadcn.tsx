/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BubbleTooltip } from "./BubbleTooltip";

interface CostAnalysisChartShadcnProps {
  data: {
    category: string;
    total_cost: number;
    avg_cost: number;
    count: number;
  }[];
}

interface BubbleData {
  x: number; // avg_cost
  y: number; // total_cost
  r: number; // session count (for tooltip)
  name: string; // category
  color: string; // theme color
  radius: number; // pixel radius for rendering
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220 70% 50%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 65% 50%)",
  "hsl(340 75% 55%)"
];

const chartConfig = {
  cost: {
    label: "Cost Analysis"
  }
} satisfies ChartConfig;

export function CostAnalysisChartShadcn({ data }: CostAnalysisChartShadcnProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis by Category</CardTitle>
          <CardDescription>Bubble size represents number of sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No category cost data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we should use log scale - when the range is > 100x
  const maxTotalCost = Math.max(...data.map((d) => d.total_cost));
  const minTotalCost =
    Math.min(...data.filter((d) => d.total_cost > 0).map((d) => d.total_cost)) || 0.001;
  const maxAvgCost = Math.max(...data.map((d) => d.avg_cost));
  const minAvgCost =
    Math.min(...data.filter((d) => d.avg_cost > 0).map((d) => d.avg_cost)) || 0.001;

  const yAxisRange = maxTotalCost / minTotalCost;
  const xAxisRange = maxAvgCost / minAvgCost;
  const useLogScaleY = yAxisRange > 100;
  const useLogScaleX = xAxisRange > 100;

  // Calculate max count for scaling bubble sizes
  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));
  const countRange = maxCount - minCount;

  // Transform data for bubble chart with simple radius scaling
  const chartData: BubbleData[] = data
    .filter((item) => item.avg_cost > 0 && item.total_cost > 0) // Filter out zero values for log scale
    .map((item, index) => {
      // Scale radius between 8 and 40 pixels based on session count
      const normalizedSize =
        countRange === 0 ? 20 : ((item.count - minCount) / countRange) * 32 + 8;

      return {
        x: item.avg_cost,
        y: item.total_cost,
        r: item.count, // Store original count for tooltip
        name: item.category,
        color: COLORS[index % COLORS.length],
        // Add radius for Recharts
        radius: normalizedSize
      };
    });

  // Calculate totals for footer
  const totalCost = data.reduce((sum, item) => sum + item.total_cost, 0);
  const totalSessions = data.reduce((sum, item) => sum + item.count, 0);
  const avgCostPerSession = totalCost / totalSessions;

  // Determine appropriate decimal places for Y-axis based on max value
  const getYAxisDecimals = (maxValue: number) => {
    if (maxValue >= 100) return 0;
    if (maxValue >= 10) return 1;
    if (maxValue >= 1) return 2;
    if (maxValue >= 0.1) return 3;
    return 4;
  };
  const yAxisDecimals = getYAxisDecimals(maxTotalCost);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Cost Analysis by Category
          {(useLogScaleX || useLogScaleY) && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({useLogScaleX && "Log X"}
              {useLogScaleX && useLogScaleY && ", "}
              {useLogScaleY && "Log Y"})
            </span>
          )}
        </CardTitle>
        <CardDescription>
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="underline-offset-4 hover:underline cursor-help">
                Bubble size represents number of sessions
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Understanding the Chart</h4>
                <p className="text-sm text-muted-foreground">
                  Each bubble represents a category with three dimensions:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>
                    <strong>Position (X-axis)</strong>: Average cost per session
                  </li>
                  <li>
                    <strong>Height (Y-axis)</strong>: Total cumulative cost
                  </li>
                  <li>
                    <strong>Size</strong>: Number of sessions (larger = more sessions)
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground italic mt-2">
                  This helps identify expensive categories (top-right) and high-volume categories
                  (large bubbles).
                  {(useLogScaleX || useLogScaleY) && (
                    <>
                      <br />
                      <br />
                      <strong>Note:</strong>{" "}
                      {useLogScaleX && useLogScaleY
                        ? "Both axes use"
                        : useLogScaleX
                          ? "X-axis uses"
                          : "Y-axis uses"}{" "}
                      logarithmic scale to better visualize data with large value ranges.
                    </>
                  )}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 30,
              left: 30
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="x"
              name="avgCost"
              scale={useLogScaleX ? "log" : "linear"}
              domain={
                useLogScaleX
                  ? [minAvgCost * 0.9, maxAvgCost * 1.1]
                  : ["dataMin - 5%", "dataMax + 5%"]
              }
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1) return `€${value.toFixed(1)}`;
                if (value >= 0.1) return `€${value.toFixed(2)}`;
                return `€${value.toFixed(3)}`;
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="totalCost"
              scale={useLogScaleY ? "log" : "linear"}
              domain={
                useLogScaleY
                  ? [minTotalCost * 0.9, maxTotalCost * 1.1]
                  : ["dataMin - 5%", "dataMax + 5%"]
              }
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 100) return `€${Math.round(value)}`;
                if (value >= 10) return `€${value.toFixed(1)}`;
                if (value >= 1) return `€${value.toFixed(2)}`;
                return `€${value.toFixed(yAxisDecimals)}`;
              }}
            />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<BubbleTooltip />} />
            <Scatter
              name="Categories"
              data={chartData}
              shape={(props: unknown) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: BubbleData;
                };
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={payload.radius}
                    fill={payload.color}
                    fillOpacity={0.6}
                    stroke={payload.color}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ScatterChart>
        </ChartContainer>

        {/* Axis label hover cards */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-help"
              >
                Average Cost per Session (€)
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">X-Axis: Average Cost per Session</h4>
                <p className="text-sm text-muted-foreground">
                  Shows the average cost of each individual session within a category.
                </p>
                <p className="text-sm text-muted-foreground">
                  Calculated as: Total cost of category ÷ Number of sessions
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Example: If &quot;HR Questions&quot; had 100 sessions costing €10 total, the
                  average would be €0.10 per session
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-help"
              >
                Total Cost (€)
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Y-Axis: Total Cost</h4>
                <p className="text-sm text-muted-foreground">
                  Shows the cumulative cost for all sessions in that category.
                </p>
                <p className="text-sm text-muted-foreground">
                  This is the sum of all costs for that specific category.
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Example: &quot;HR Questions&quot; might have a total cost of €10 for all its
                  sessions combined
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div>
            <div className="text-muted-foreground">Total Cost</div>
            <div className="font-semibold">€{totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Sessions</div>
            <div className="font-semibold">{totalSessions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Cost/Session</div>
            <div className="font-semibold">€{avgCostPerSession.toFixed(4)}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
