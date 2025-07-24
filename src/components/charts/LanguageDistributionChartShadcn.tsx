/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { TrendingUp } from "lucide-react";
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

interface LanguageDistributionChartShadcnProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function LanguageDistributionChartShadcn({ data }: LanguageDistributionChartShadcnProps) {
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
    sessions: data.values[index] ?? 0
  }));

  const totalSessions = data.values.reduce((sum, val) => sum + val, 0);
  const topLanguage = chartData[0];
  const languageCount = chartData.length;

  const chartConfig: ChartConfig = {
    sessions: {
      label: "Sessions",
      theme: {
        light: "hsl(142.1 76.2% 36.3%)",
        dark: "hsl(142.1 70.6% 45.3%)"
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
        <CardDescription>Sessions across different languages</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="language"
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
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-semibold">{item.payload.language}</span>
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
          <TrendingUp className="h-4 w-4" />
          Supporting {languageCount} languages
        </div>
        <div className="text-muted-foreground leading-none">
          {topLanguage && (
            <>
              Primary language: {topLanguage.language} (
              {((topLanguage.sessions / totalSessions) * 100).toFixed(1)}%)
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
