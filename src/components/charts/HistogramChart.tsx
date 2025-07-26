/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ChartOptions } from "chart.js";
import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useChartSetup } from "@/hooks/useChartSetup";
import { CHART_DEFAULTS, DEFAULT_CHART_COLOR } from "@/lib/constants/charts";
import type { DataChartProps } from "@/lib/types/charts";
import { ChartWrapper } from "./ChartWrapper";

interface HistogramChartProps extends DataChartProps<number> {
  bins?: number;
  xLabel?: string;
  color?: string;
}

interface HistogramData {
  labels: string[];
  values: number[];
  stats: {
    mean: number;
    median: number;
    total: number;
    isInteger: boolean;
  };
}

function calculateHistogram(data: number[], bins: number): HistogramData {
  if (!data.length) {
    return {
      labels: [],
      values: [],
      stats: { mean: 0, median: 0, total: 0, isInteger: false }
    };
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  const histogram = new Array(bins).fill(0);
  const binLabels: string[] = [];
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

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    binLabels.push(`${formatValue(binStart)}-${formatValue(binEnd)}`);

    data.forEach((value) => {
      if (value >= binStart && value < binEnd) {
        histogram[i]++;
      } else if (i === bins - 1 && value === max) {
        histogram[i]++;
      }
    });
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    labels: binLabels,
    values: histogram,
    stats: {
      mean,
      median,
      total: data.length,
      isInteger: dataIsIntegers
    }
  };
}

export const HistogramChart = memo(
  ({
    data,
    bins = 10,
    title = "Distribution",
    xLabel = "Value",
    color = DEFAULT_CHART_COLOR
  }: HistogramChartProps) => {
    useChartSetup();
    const isEmpty = !data.length;

    const { chartData, options, stats } = useMemo(() => {
      const histogramData = calculateHistogram(data, bins);
      const { labels, values, stats } = histogramData;

      const chartData = {
        labels,
        datasets: [
          {
            label: "Frequency",
            data: values,
            backgroundColor: `${color}80`,
            borderColor: color,
            borderWidth: CHART_DEFAULTS.borderWidth,
            borderRadius: CHART_DEFAULTS.borderRadius
          }
        ]
      };

      const options: ChartOptions<"bar"> = {
        responsive: CHART_DEFAULTS.responsive,
        maintainAspectRatio: CHART_DEFAULTS.maintainAspectRatio,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                return `${xLabel}: ${context[0].label}`;
              },
              label: (context) => {
                const count = context.parsed.y;
                const percentage = ((count / stats.total) * 100).toFixed(1);
                return `Count: ${count} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel
            }
          },
          y: {
            title: {
              display: true,
              text: "Frequency"
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      };

      return { chartData, options, stats };
    }, [data, bins, xLabel, color, isEmpty]);

    const formatStat = (val: number) => {
      if (stats.isInteger) {
        return Math.round(val).toString();
      }
      return val.toFixed(1);
    };

    return (
      <ChartWrapper title={title} isEmpty={isEmpty}>
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">Mean</div>
            <div className="font-semibold">{formatStat(stats.mean)}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Median</div>
            <div className="font-semibold">{formatStat(stats.median)}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Total</div>
            <div className="font-semibold">{stats.total}</div>
          </div>
        </div>
        <div className="relative h-64">
          <Bar data={chartData} options={options} />
        </div>
      </ChartWrapper>
    );
  }
);

HistogramChart.displayName = "HistogramChart";
