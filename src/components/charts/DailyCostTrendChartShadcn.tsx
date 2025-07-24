/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { getChartColors } from "@/lib/utils/chartColors";

interface DailyCostTrendChartShadcnProps {
  data: {
    dates: string[];
    values: number[];
    message_counts?: number[];
  };
}

export function DailyCostTrendChartShadcn({ data }: DailyCostTrendChartShadcnProps) {
  const colors = getChartColors();

  // Transform data for recharts format
  const chartData = data.dates.map((date, index) => {
    const dataPoint: Record<string, string | number> = {
      date,
      cost: data.values[index]
    };

    if (data.message_counts) {
      dataPoint.messages = data.message_counts[index];
    }

    return dataPoint;
  });

  const chartConfig: ChartConfig = {
    cost: {
      label: "Daily Cost (€)",
      color: colors.yellow
    }
  };

  if (data.message_counts) {
    chartConfig.messages = {
      label: "Message Count",
      color: colors.blue
    };
  }

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost & Message Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[1.125rem] sm:text-xl">
          Daily Cost & Message Volume Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 sm:h-80 w-full">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: data.message_counts ? 50 : 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="cost"
              orientation="left"
              tick={{ fontSize: 12 }}
              label={{ value: "Cost (€)", angle: -90, position: "insideLeft" }}
              tickFormatter={(value) => `€${value.toFixed(2)}`}
            />
            {data.message_counts && (
              <YAxis
                yAxisId="messages"
                orientation="right"
                tick={{ fontSize: 12 }}
                label={{ value: "Messages", angle: 90, position: "insideRight" }}
              />
            )}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "cost") {
                      return `€${Number(value).toFixed(2)}`;
                    }
                    return value;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              yAxisId="cost"
              type="monotone"
              dataKey="cost"
              stroke={colors.yellow}
              strokeWidth={2}
              fill={colors.yellow}
              fillOpacity={0.25}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            {data.message_counts && (
              <Line
                yAxisId="messages"
                type="monotone"
                dataKey="messages"
                stroke={colors.blue}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
