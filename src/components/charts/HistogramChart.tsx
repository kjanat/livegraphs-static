/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { setupCharts } from "./ChartConfig";

setupCharts();

interface HistogramChartProps {
  data: number[];
  bins?: number;
  title?: string;
  xLabel?: string;
  color?: string;
}

export function HistogramChart({
  data,
  bins = 10,
  title = "Distribution",
  xLabel = "Value",
  color = "#3b82f6"
}: HistogramChartProps) {
  if (!data.length) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="text-center text-muted-foreground py-12">No data available</div>
      </div>
    );
  }

  // Calculate histogram bins
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  const histogram = new Array(bins).fill(0);
  const binLabels = [];

  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;

    // Format labels based on whether the data appears to be integers
    // Improved logic: if all data points are integers AND bin width is reasonably close to an integer,
    // format as integers
    const dataIsIntegers = data.every((val) => Number.isInteger(val));
    const binWidthIsReasonable = binWidth >= 0.5; // Don't show decimals for reasonable bin widths

    const formatValue = (val: number) => {
      // If data consists of integers and we have reasonable bin widths,
      // always round to integers regardless of the exact boundary value
      if (dataIsIntegers && binWidthIsReasonable) {
        return Math.round(val).toString();
      }
      // Otherwise, show decimals only if needed
      if (val % 1 === 0) {
        return Math.round(val).toString();
      }
      return val.toFixed(1);
    };

    binLabels.push(`${formatValue(binStart)}-${formatValue(binEnd)}`);

    data.forEach((value) => {
      if (value >= binStart && value < binEnd) {
        histogram[i]++;
      } else if (i === bins - 1 && value === max) {
        histogram[i]++;
      }
    });
  }

  const chartData = {
    labels: binLabels,
    datasets: [
      {
        label: "Frequency",
        data: histogram,
        backgroundColor: `${color}80`,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
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
            const percentage = ((count / data.length) * 100).toFixed(1);
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

  // Calculate statistics
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Use consistent formatting for statistics
  const dataIsIntegers = data.every((val) => Number.isInteger(val));
  const formatStat = (val: number) => {
    // If data is all integers, round statistics to integers too
    if (dataIsIntegers) {
      return Math.round(val).toString();
    }
    return val.toFixed(1);
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
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
      <div className="relative h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
