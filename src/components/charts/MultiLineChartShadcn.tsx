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

interface Dataset {
  label: string;
  dataKey: string;
  color: string;
}

interface MultiLineChartShadcnProps {
  data: Record<string, string | number>[];
  datasets: Dataset[];
  title?: string;
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Renders a multi-line chart within a styled card, visualizing multiple datasets over a shared x-axis.
 *
 * Displays a "No data available" message if the provided data array is empty. Each dataset is rendered as a distinct colored line, with optional chart title and axis labels.
 *
 * @param data - Array of records representing the chart data points
 * @param datasets - Array describing each line's label, data key, and color
 * @param title - Optional chart title displayed in the card header
 * @param xAxisKey - Key in the data records to use for the x-axis
 * @param xAxisLabel - Optional label for the x-axis
 * @param yAxisLabel - Optional label for the y-axis
 * @returns A React element containing the multi-line chart or a message if no data is available
 */
export function MultiLineChartShadcn({
  data,
  datasets,
  title = "Trends Over Time",
  xAxisKey,
  xAxisLabel,
  yAxisLabel
}: MultiLineChartShadcnProps) {
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

  const chartConfig: ChartConfig = datasets.reduce((acc, dataset) => {
    acc[dataset.dataKey] = {
      label: dataset.label,
      color: dataset.color
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[1.125rem] sm:text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 sm:h-80 w-full">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
              label={
                xAxisLabel
                  ? { value: xAxisLabel, position: "insideBottom", offset: -40 }
                  : undefined
              }
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={
                yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {datasets.map((dataset) => (
              <Line
                key={dataset.dataKey}
                type="monotone"
                dataKey={dataset.dataKey}
                stroke={dataset.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
