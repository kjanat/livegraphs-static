/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import * as React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface CostAnalysisChartShadcnProps {
  data: {
    category: string;
    total_cost: number;
    avg_cost: number;
    count: number;
  }[];
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

  // Calculate max count for scaling bubble sizes
  const maxCount = Math.max(...data.map((d) => d.count));
  const minCount = Math.min(...data.map((d) => d.count));
  const countRange = maxCount - minCount;

  // Transform data for scatter chart
  const chartData = data.map((item, index) => ({
    x: item.avg_cost,
    y: item.total_cost,
    z: item.count,
    // Scale bubble size between 100 and 2000 based on count
    // If all counts are the same, use a fixed size
    size: countRange === 0 ? 1000 : ((item.count - minCount) / countRange) * 1900 + 100,
    category: item.category,
    color: COLORS[index % COLORS.length]
  }));

  // Calculate totals for footer
  const totalCost = data.reduce((sum, item) => sum + item.total_cost, 0);
  const totalSessions = data.reduce((sum, item) => sum + item.count, 0);
  const avgCostPerSession = totalCost / totalSessions;

  // Determine appropriate decimal places for Y-axis based on max value
  const maxTotalCost = Math.max(...data.map((d) => d.total_cost));
  const getYAxisDecimals = (maxValue: number) => {
    if (maxValue >= 100) return 0;
    if (maxValue >= 10) return 1;
    if (maxValue >= 1) return 2;
    if (maxValue >= 0.1) return 3;
    return 4;
  };
  const yAxisDecimals = getYAxisDecimals(maxTotalCost);

  // Custom dot component to render sized bubbles
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = Math.sqrt(payload.size / Math.PI);
    // Ensure radius is a valid number
    const safeRadius = isNaN(radius) || !isFinite(radius) ? 10 : radius;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={safeRadius}
        fill={payload.color}
        fillOpacity={0.6}
        stroke={payload.color}
        strokeWidth={2}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis by Category</CardTitle>
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
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value.toFixed(3)}`}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="totalCost"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${Number(value).toFixed(yAxisDecimals)}`}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-semibold">{item.payload.category}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Avg Cost:</span>
                        <span className="font-semibold">€{item.payload.x.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-semibold">€{item.payload.y.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="font-semibold">{item.payload.z.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Scatter name="Categories" data={chartData} shape={<CustomDot />} />
          </ScatterChart>
        </ChartContainer>

        {/* Axis label hover cards */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-help">
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
                  Example: If "HR Questions" had 100 sessions costing €10 total, the average would
                  be €0.10 per session
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-sm text-muted-foreground underline-offset-4 hover:underline cursor-help">
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
                  Example: "HR Questions" might have a total cost of €10 for all its sessions
                  combined
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
