/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ChartOptions } from "chart.js";
import { memo, useMemo } from "react";
import { Bubble } from "react-chartjs-2";
import { useChartSetup } from "@/hooks/useChartSetup";
import { CHART_COLORS, CHART_DEFAULTS } from "@/lib/constants/charts";
import { ChartWrapper } from "./ChartWrapper";

interface BubbleDataPoint {
  category: string;
  total_cost: number;
  avg_cost: number;
  count: number;
}

interface BubbleChartProps {
  data: BubbleDataPoint[];
  title?: string;
}

export const BubbleChart = memo(
  ({ data, title = "Cost Analysis by Category" }: BubbleChartProps) => {
    useChartSetup();
    const isEmpty = !data.length;

    const { chartData, options } = useMemo(() => {
      if (isEmpty) return { chartData: { datasets: [] }, options: {} };

      const maxCount = Math.max(...data.map((d) => d.count));

      const chartData = {
        datasets: [
          {
            label: "Categories",
            data: data.map((item) => ({
              x: item.avg_cost,
              y: item.total_cost,
              r: Math.sqrt(item.count / maxCount) * 30 + 5,
              category: item.category,
              count: item.count
            })),
            backgroundColor: data.map(
              (_, index) => `${CHART_COLORS[index % CHART_COLORS.length]}80`
            ),
            borderColor: data.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
            borderWidth: 2
          }
        ]
      };

      const options: ChartOptions<"bubble"> = {
        responsive: CHART_DEFAULTS.responsive,
        maintainAspectRatio: CHART_DEFAULTS.maintainAspectRatio,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const data = context.raw as {
                  x: number;
                  y: number;
                  r: number;
                  category: string;
                  count: number;
                };
                return [
                  `Category: ${data.category}`,
                  `Avg Cost: €${data.x.toFixed(4)}`,
                  `Total Cost: €${data.y.toFixed(2)}`,
                  `Sessions: ${data.count}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Average Cost per Session (€)"
            },
            ticks: {
              callback: (value) => `€${Number(value).toFixed(3)}`
            }
          },
          y: {
            title: {
              display: true,
              text: "Total Cost (€)"
            },
            ticks: {
              callback: (value) => `€${Number(value).toFixed(0)}`
            }
          }
        }
      };

      return { chartData, options };
    }, [data, isEmpty]);

    return (
      <ChartWrapper
        title={title}
        isEmpty={isEmpty}
        emptyMessage="No category cost data available"
        contentClassName="relative"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Bubble size represents number of sessions
        </p>
        <div className="h-96">
          <Bubble data={chartData} options={options} />
        </div>
      </ChartWrapper>
    );
  }
);

BubbleChart.displayName = "BubbleChart";
