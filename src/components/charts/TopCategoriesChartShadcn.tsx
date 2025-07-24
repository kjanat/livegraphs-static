/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

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

interface TopCategoriesChartShadcnProps {
  data: {
    labels: string[];
    values: number[];
  };
  limit?: number;
}

export function TopCategoriesChartShadcn({ data, limit = 8 }: TopCategoriesChartShadcnProps) {
  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("TopCategoriesChart: labels and values arrays must have equal length");
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
        </CardContent>
      </Card>
    );
  }

  // Slice both arrays to the same limit to ensure indices align
  const maxLength = Math.min(data.labels.length, data.values.length, limit);
  const slicedLabels = data.labels.slice(0, maxLength);
  const slicedValues = data.values.slice(0, maxLength);

  const chartData = slicedLabels.map((label, index) => ({
    category: label,
    sessions: slicedValues[index] ?? 0
  }));

  const totalSessions = slicedValues.reduce((sum, val) => sum + val, 0);
  const topCategory = chartData[0];

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      theme: {
        light: "hsl(262.1 83.3% 57.8%)",
        dark: "hsl(263.4 70% 50.4%)"
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>Most common conversation topics</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 60, bottom: 20, left: 120 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={110}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-semibold">{item.payload.category}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="font-semibold">
                          {((Number(value) / totalSessions) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[0, 8, 8, 0]}>
              <LabelList position="right" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          {topCategory && (
            <>
              "{topCategory.category}" leads with {topCategory.sessions} sessions (
              {((topCategory.sessions / totalSessions) * 100).toFixed(1)}%)
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
