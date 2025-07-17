"use client";

import type { ChartOptions } from "chart.js";
import { Bubble } from "react-chartjs-2";
import { setupCharts } from "./ChartConfig";

setupCharts();

interface BubbleChartProps {
  data: {
    category: string;
    total_cost: number;
    avg_cost: number;
    count: number;
  }[];
  title?: string;
}

export function BubbleChart({ data, title = "Cost Analysis by Category" }: BubbleChartProps) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div className="text-center text-gray-500 py-12">No category cost data available</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#84CC16"
  ];

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
        backgroundColor: data.map((_, index) => `${colors[index % colors.length]}80`),
        borderColor: data.map((_, index) => colors[index % colors.length]),
        borderWidth: 2
      }
    ]
  };

  const options: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="text-sm text-gray-600 mb-4">Bubble size represents number of sessions</div>
      <div className="relative h-96">
        <Bubble data={chartData} options={options} />
      </div>
    </div>
  );
}
