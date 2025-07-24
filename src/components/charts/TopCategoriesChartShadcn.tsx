/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { getChartColors } from "@/lib/utils/chartColors";

interface TopCategoriesChartShadcnProps {
  data: {
    labels: string[];
    values: number[];
  };
  limit?: number;
}

export function TopCategoriesChartShadcn({ data, limit = 8 }: TopCategoriesChartShadcnProps) {
  const colors = getChartColors();

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

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      color: colors.purple
    }
  };

  return (
    <Card
      className="h-full flex flex-col"
      role="img"
      aria-labelledby="categories-chart-title"
      aria-describedby="categories-chart-desc"
    >
      <CardHeader>
        <CardTitle id="categories-chart-title">Top Categories</CardTitle>
        <CardDescription id="categories-chart-desc" className="sr-only">
          Horizontal bar chart showing the most common categories of chatbot sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 50, left: 150 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              label={{ value: "Sessions", position: "insideBottom", offset: -5 }}
            />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={140} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => `${value} sessions`} />}
            />
            <Bar dataKey="sessions" fill={colors.purple} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
