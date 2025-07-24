/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Globe } from "lucide-react";
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

  // Limit to top 8 countries like Top Categories
  const limit = 8;
  const maxLength = Math.min(data.labels.length, data.values.length, limit);
  const slicedLabels = data.labels.slice(0, maxLength);
  const slicedValues = data.values.slice(0, maxLength);

  const chartData = slicedLabels.map((label, index) => ({
    country: label,
    sessions: slicedValues[index] ?? 0
  }));

  const totalSessions = data.values.reduce((sum, val) => sum + val, 0);
  const topCountry = chartData[0];
  const countryCount = data.labels.length;
  const topPercentage = topCountry ? ((topCountry.sessions / totalSessions) * 100).toFixed(1) : 0;

  const chartConfig = {
    sessions: {
      label: "Sessions",
      color: "var(--chart-2)"
    },
    label: {
      color: "var(--background)"
    }
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions by Country</CardTitle>
        <CardDescription>Geographic distribution of user sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px] lg:h-[400px] w-full sm:max-w-[500px] lg:max-w-[600px] mx-auto">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="country"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="sessions" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar dataKey="sessions" layout="vertical" fill="var(--color-sessions)" radius={4} minPointSize={5}>
              <LabelList
                dataKey="country"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
                formatter={(value: string, entry: any) => {
                  // If the bar is too small, truncate the country name
                  const sessions = entry?.sessions || 0;
                  const percentage = (sessions / totalSessions) * 100;
                  if (percentage < 5 && value.length > 10) {
                    return value.substring(0, 10) + "...";
                  }
                  return value;
                }}
              />
              <LabelList
                dataKey="sessions"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          <Globe className="h-4 w-4" />
          Active in {countryCount} countries
        </div>
        <div className="text-muted-foreground leading-none">
          {topCountry && (
            <>
              Top location: {topCountry.country} (
              {((topCountry.sessions / totalSessions) * 100).toFixed(1)}% of traffic)
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
