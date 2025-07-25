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
import { DynamicBarLabel } from "@/components/ui/DynamicBarLabel";

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

  // Limit to top 8 languages like Top Categories
  const limit = 8;
  const maxLength = Math.min(data.labels.length, data.values.length, limit);
  const slicedLabels = data.labels.slice(0, maxLength);
  const slicedValues = data.values.slice(0, maxLength);

  const chartData = slicedLabels.map((label, index) => ({
    language: label,
    sessions: slicedValues[index] ?? 0
  }));

  const totalSessions = data.values.reduce((sum, val) => sum + val, 0);
  const topLanguage = chartData[0];
  const languageCount = data.labels.length;

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
        <CardTitle>Language Distribution</CardTitle>
        <CardDescription>Sessions across different languages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] sm:h-[350px] lg:h-[400px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
              left: 10
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="language"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="sessions" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Bar
              dataKey="sessions"
              layout="vertical"
              fill="var(--color-sessions)"
              radius={4}
              minPointSize={5}
            >
              <LabelList dataKey="language" content={DynamicBarLabel} position="insideLeft" />
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
      <CardFooter className="flex-col items-center gap-2 text-sm text-center">
        <div className="flex gap-2 leading-none font-medium items-center">
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
