/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
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

interface DistributionBarChartProps {
  data: number[];
  bins?: number;
  title?: string;
  description?: string;
  color?: string;
  showTrend?: boolean;
  formatLabel?: (value: number) => string;
}

export function DistributionBarChart({
  data,
  bins = 8,
  title = "Distribution",
  description,
  color = "hsl(var(--chart-1))",
  showTrend = true,
  formatLabel
}: DistributionBarChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">No data available</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate histogram bins
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  const histogramData = [];

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;

    // Format range labels
    const formatValue = (val: number) => {
      if (formatLabel) return formatLabel(val);
      if (Number.isInteger(val) && Number.isInteger(binStart) && Number.isInteger(binEnd)) {
        return val.toString();
      }
      return val.toFixed(1);
    };

    const rangeLabel =
      i === bins - 1
        ? `${formatValue(binStart)}+`
        : `${formatValue(binStart)}-${formatValue(binEnd)}`;

    let count = 0;
    data.forEach((value) => {
      if (value >= binStart && value < binEnd) {
        count++;
      } else if (i === bins - 1 && value >= binStart) {
        count++;
      }
    });

    histogramData.push({
      range: rangeLabel,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1)
    });
  }

  // Calculate statistics
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mode = histogramData.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  ).range;

  // Calculate trend (compare first half to second half average)
  const halfPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, halfPoint);
  const secondHalf = data.slice(halfPoint);
  const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendPercentage = (((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(1);
  const isIncreasing = secondHalfAvg > firstHalfAvg;

  const chartConfig = {
    count: {
      label: "Frequency",
      color: color
    }
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={histogramData}
            margin={{
              top: 20,
              right: 20,
              bottom: 5,
              left: 0
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
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
                  formatter={(value, _name, item) => (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Count:</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="font-semibold">{item.payload.percentage}%</span>
                      </div>
                    </>
                  )}
                />
              }
            />
            <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <div className="grid grid-cols-3 gap-4 w-full text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Mean</div>
            <div className="font-semibold">{formatLabel ? formatLabel(mean) : mean.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Median</div>
            <div className="font-semibold">
              {formatLabel ? formatLabel(median) : median.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Mode</div>
            <div className="font-semibold">{mode}</div>
          </div>
        </div>
        {showTrend && (
          <div className="flex gap-2 leading-none font-medium text-sm">
            {isIncreasing ? (
              <>
                Trending up by {Math.abs(Number(trendPercentage))}%{" "}
                <TrendingUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(Number(trendPercentage))}%{" "}
                <TrendingDown className="h-4 w-4" />
              </>
            )}
          </div>
        )}
        <div className="text-muted-foreground leading-none text-sm">
          Distribution of {data.length.toLocaleString()} data points
        </div>
      </CardFooter>
    </Card>
  );
}
