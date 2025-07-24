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

/**
 * Props for SessionsByCountryChartShadcn component
 * @interface SessionsByCountryChartShadcnProps
 */
interface SessionsByCountryChartShadcnProps {
  /**
   * Chart data containing country labels and corresponding session values
   * @property {string[]} labels - Array of country names (must match length of values array)
   * @property {number[]} values - Array of session counts (must match length of labels array)
   */
  data: {
    labels: string[];
    values: number[];
  };
}

export function SessionsByCountryChartShadcn({ data }: SessionsByCountryChartShadcnProps) {
  const colors = getChartColors();

  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("SessionsByCountryChart: labels and values arrays must have equal length");
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
        </CardContent>
      </Card>
    );
  }

  // Create chartData with safe mapping to prevent undefined values
  const maxLength = Math.min(data.labels.length, data.values.length);
  const chartData = data.labels.slice(0, maxLength).map((label, index) => ({
    country: label,
    sessions: data.values[index] ?? 0
  }));

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      color: colors.blue
    }
  };

  return (
    <Card
      className="h-full flex flex-col"
      role="img"
      aria-labelledby="country-chart-title"
      aria-describedby="country-chart-desc"
    >
      <CardHeader>
        <CardTitle id="country-chart-title">Sessions by Country</CardTitle>
        <CardDescription id="country-chart-desc" className="sr-only">
          Horizontal bar chart showing the number of chatbot sessions by country
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              label={{ value: "Sessions", position: "insideBottom", offset: -5 }}
            />
            <YAxis dataKey="country" type="category" tick={{ fontSize: 12 }} width={50} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="font-semibold">{item.payload.country}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    </>
                  )}
                />
              }
            />
            <Bar dataKey="sessions" fill={colors.blue} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
