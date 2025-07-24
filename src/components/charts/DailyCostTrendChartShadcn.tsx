/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface DailyCostTrendChartShadcnProps {
  data: {
    dates: string[];
    values: number[];
    message_counts?: number[];
  };
}

const chartConfig = {
  views: {
    label: "Activity"
  },
  cost: {
    label: "Total Cost (€)",
    color: "var(--chart-1)"
  },
  messages: {
    label: "Messages",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

export function DailyCostTrendChartShadcn({ data }: DailyCostTrendChartShadcnProps) {
  const [activeChart, setActiveChart] = React.useState<"cost" | "messages">("cost");

  // Transform data for recharts format
  const chartData = data.dates.map((date, index) => {
    const dataPoint: Record<string, string | number> = {
      date,
      cost: data.values[index] ?? 0
    };

    if (data.message_counts) {
      dataPoint.messages = data.message_counts[index] ?? 0;
    }

    return dataPoint;
  });

  const total = React.useMemo(
    () => ({
      cost: data.values.reduce((acc, curr) => acc + (curr || 0), 0),
      messages: data.message_counts?.reduce((acc, curr) => acc + (curr || 0), 0) || 0
    }),
    [data]
  );

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

  const showMessages = data.message_counts && data.message_counts.length > 0;

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Daily Cost & Message Volume Trend</CardTitle>
          <CardDescription>
            Showing {activeChart === "cost" ? "costs in euros" : "message volumes"} over time
          </CardDescription>
        </div>
        <div className="flex">
          <button
            type="button"
            data-active={activeChart === "cost"}
            className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            onClick={() => setActiveChart("cost")}
          >
            <span className="text-muted-foreground text-xs">{chartConfig.cost.label}</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              €{total.cost.toFixed(2)}
            </span>
          </button>
          {showMessages && (
            <button
              type="button"
              data-active={activeChart === "messages"}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart("messages")}
            >
              <span className="text-muted-foreground text-xs">{chartConfig.messages.label}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total.messages.toLocaleString()}
              </span>
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                  }}
                  formatter={(value, name) => {
                    if (name === "cost") {
                      return `€${Number(value).toFixed(2)}`;
                    }
                    return value;
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
