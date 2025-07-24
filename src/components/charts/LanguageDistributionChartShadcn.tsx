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

interface LanguageDistributionChartShadcnProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function LanguageDistributionChartShadcn({ data }: LanguageDistributionChartShadcnProps) {
  const colors = getChartColors();

  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("LanguageDistributionChart: labels and values arrays must have equal length");
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    language: label,
    sessions: data.values[index]
  }));

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      color: colors.green
    }
  };

  return (
    <Card
      className="h-full flex flex-col"
      role="img"
      aria-labelledby="language-chart-title"
      aria-describedby="language-chart-desc"
    >
      <CardHeader>
        <CardTitle id="language-chart-title">Language Distribution</CardTitle>
        <CardDescription id="language-chart-desc" className="sr-only">
          Bar chart showing the distribution of chatbot sessions across different languages
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 10, right: 30, left: 60, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              dataKey="language"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: "Sessions", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => `${value} sessions`} />}
            />
            <Bar dataKey="sessions" fill={colors.green} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
