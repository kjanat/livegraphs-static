/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { PolarGrid, RadialBar, RadialBarChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";

interface GaugeChartShadcnProps {
  value: number;
  max?: number;
  title?: string;
  description?: string;
  unit?: string;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

export function GaugeChartShadcn({
  value,
  max = 100,
  title,
  description,
  unit = "%",
  thresholds = { low: 30, medium: 60, high: 80 }
}: GaugeChartShadcnProps) {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Determine color based on thresholds
  const getColor = (val: number) => {
    if (val >= thresholds.high) return "hsl(142, 76%, 36%)"; // Green
    if (val >= thresholds.medium) return "hsl(45, 93%, 47%)"; // Yellow
    if (val >= thresholds.low) return "hsl(25, 95%, 53%)"; // Orange
    return "hsl(0, 84%, 60%)"; // Red
  };

  const color = getColor(percentage);

  // Data for radial bar chart
  const chartData = [
    {
      name: "value",
      value: percentage,
      fill: color
    }
  ];

  const chartConfig = {
    value: {
      label: title || "Value",
      color: color
    }
  } satisfies ChartConfig;

  // Format display value
  const displayValue = unit === "%" ? `${Math.round(percentage)}%` : `${value.toFixed(1)}${unit}`;

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        {title && <CardTitle className="text-center">{title}</CardTitle>}
        {description && (
          <CardDescription className="text-center">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="underline-offset-4 hover:underline cursor-help">
                  {description}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Radial Bar Gauge Design</h4>
                  <p className="text-sm text-muted-foreground">
                    This gauge uses a radial bar chart that fills from left to right in a semi-circle arc.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The color changes based on thresholds:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                    <li><span className="text-red-500">Red</span>: Below {thresholds.low}%</li>
                    <li><span className="text-orange-500">Orange</span>: {thresholds.low}% - {thresholds.medium}%</li>
                    <li><span className="text-yellow-500">Yellow</span>: {thresholds.medium}% - {thresholds.high}%</li>
                    <li><span className="text-green-500">Green</span>: Above {thresholds.high}%</li>
                  </ul>
                  <p className="text-xs text-muted-foreground italic">
                    Best for showing progress or completion metrics with clear thresholds.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={10}
              fill={color}
              className="[&_.recharts-radial-bar-background]:fill-muted"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan x="50%" dy="-0.25em" className="text-3xl font-bold">
                {displayValue}
              </tspan>
              {max !== 100 && (
                <tspan x="50%" dy="1.5em" className="text-sm text-muted-foreground">
                  of {max}
                  {unit}
                </tspan>
              )}
            </text>
          </RadialBarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)" }} />
            <span className="text-muted-foreground">Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "hsl(25, 95%, 53%)" }}
            />
            <span className="text-muted-foreground">Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "hsl(45, 93%, 47%)" }}
            />
            <span className="text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "hsl(142, 76%, 36%)" }}
            />
            <span className="text-muted-foreground">Excellent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
