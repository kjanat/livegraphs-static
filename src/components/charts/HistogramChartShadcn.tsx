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

interface HistogramChartShadcnProps {
  data: number[];
  bins?: number;
  title?: string;
  xLabel?: string;
  color?: string;
}

export function HistogramChartShadcn({
  data,
  bins = 10,
  title = "Distribution",
  xLabel = "Value",
  color = "#3b82f6"
}: HistogramChartShadcnProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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

    // Format labels based on whether the data appears to be integers
    const dataIsIntegers = data.every((val) => Number.isInteger(val));
    const binWidthIsReasonable = binWidth >= 0.5;

    const formatValue = (val: number) => {
      if (dataIsIntegers && binWidthIsReasonable) {
        return Math.round(val).toString();
      }
      if (val % 1 === 0) {
        return Math.round(val).toString();
      }
      return val.toFixed(1);
    };

    const binLabel = `${formatValue(binStart)}-${formatValue(binEnd)}`;

    let count = 0;
    data.forEach((value) => {
      if (value >= binStart && value < binEnd) {
        count++;
      } else if (i === bins - 1 && value === max) {
        count++;
      }
    });

    histogramData.push({
      range: binLabel,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1)
    });
  }

  // Calculate statistics
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  const dataIsIntegers = data.every((val) => Number.isInteger(val));
  const formatStat = (val: number) => {
    if (dataIsIntegers) {
      return Math.round(val).toString();
    }
    return val.toFixed(1);
  };

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
        <CardDescription>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-muted-foreground">Mean</div>
              <div className="font-semibold">{formatStat(mean)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Median</div>
              <div className="font-semibold">{formatStat(median)}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">{data.length}</div>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              label={{ value: xLabel, position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{ value: "Frequency", angle: -90, position: "insideLeft" }}
              domain={[0, "dataMax"]}
              tickCount={6}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    return (
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
                    );
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill={color}
              fillOpacity={0.8}
              stroke={color}
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
