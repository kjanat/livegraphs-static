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
  color = "#3B82F6"
}: HistogramChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div className="text-center text-gray-500 py-12">No data available</div>
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
    binLabels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="text-gray-600">Mean</div>
          <div className="font-semibold">{mean.toFixed(1)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Median</div>
          <div className="font-semibold">{median.toFixed(1)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600">Total</div>
          <div className="font-semibold">{data.length}</div>
        </div>
      </div>
      <div className="relative h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
