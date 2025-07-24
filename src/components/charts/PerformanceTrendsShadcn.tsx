/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface PerformanceTrendsShadcnProps {
  data: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
}

const chartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(142, 76%, 36%)" // Green
  },
  neutral: {
    label: "Neutral",
    color: "hsl(0, 0%, 45%)" // Gray
  },
  negative: {
    label: "Negative",
    color: "hsl(0, 84%, 60%)" // Red
  }
} satisfies ChartConfig;

export function PerformanceTrendsShadcn({ data }: PerformanceTrendsShadcnProps) {
  const [timeRange, setTimeRange] = React.useState("30d");

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    let daysToShow = 30;

    if (timeRange === "7d") {
      daysToShow = 7;
    } else if (timeRange === "90d") {
      daysToShow = 90;
    }

    const startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() - daysToShow);

    return sortedData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [data, timeRange]);

  // Calculate totals for description
  const totals = React.useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        positive: acc.positive + item.positive,
        neutral: acc.neutral + item.neutral,
        negative: acc.negative + item.negative,
        total: acc.total + item.positive + item.neutral + item.negative
      }),
      { positive: 0, neutral: 0, negative: 0, total: 0 }
    );
  }, [filteredData]);

  const positivePercentage =
    totals.total > 0 ? ((totals.positive / totals.total) * 100).toFixed(1) : "0";

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sentiment Trends Over Time</CardTitle>
          <CardDescription>
            {positivePercentage}% positive sentiment rate for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg" aria-label="Select time range">
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 90 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
          <AreaChart
            data={filteredData}
            margin={{
              top: 10,
              right: 10,
              bottom: 40,
              left: 10
            }}
          >
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 0%, 45%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(0, 0%, 45%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="positive"
              type="monotone"
              fill="url(#fillPositive)"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              stackId="sentiment"
            />
            <Area
              dataKey="neutral"
              type="monotone"
              fill="url(#fillNeutral)"
              stroke="hsl(0, 0%, 45%)"
              strokeWidth={2}
              stackId="sentiment"
            />
            <Area
              dataKey="negative"
              type="monotone"
              fill="url(#fillNegative)"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              stackId="sentiment"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
