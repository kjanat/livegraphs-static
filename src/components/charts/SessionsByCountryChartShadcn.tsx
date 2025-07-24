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

  // Create chartData with safe mapping to prevent undefined values
  const maxLength = Math.min(data.labels.length, data.values.length);
  const chartData = data.labels.slice(0, maxLength).map((label, index) => ({
    country: label,
    sessions: data.values[index] ?? 0
  }));

  const totalSessions = data.values.reduce((sum, val) => sum + val, 0);
  const topCountry = chartData[0];
  const countryCount = chartData.length;

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      theme: {
        light: "hsl(221.2 83.2% 53.3%)",
        dark: "hsl(217.2 91.2% 59.8%)"
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Sessions by Country</CardTitle>
        <CardDescription>Geographic distribution of user sessions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="country"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Country:</span>
                        <span className="font-semibold">{item.payload.country}</span>
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
            <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[8, 8, 0, 0]}>
              <LabelList position="top" offset={8} className="fill-foreground" fontSize={11} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
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
