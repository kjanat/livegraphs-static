"use client";

import { useEffect, useRef } from "react";

interface HeatmapChartProps {
  data: {
    hour: number;
    day: string;
    count: number;
  }[];
  title?: string;
}

export function HeatmapChart({ data, title = "Usage Heatmap" }: HeatmapChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimensions
    const padding = 60;
    const cellWidth = (canvas.width - padding * 2) / 24;
    const cellHeight = (canvas.height - padding * 2) / 7;

    // Days of week
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Find max value for scaling
    const maxCount = Math.max(...data.map((d) => d.count));

    // Draw day labels
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#374151";
    days.forEach((day, i) => {
      ctx.fillText(day, 10, padding + i * cellHeight + cellHeight / 2 + 5);
    });

    // Draw hour labels
    for (let hour = 0; hour < 24; hour++) {
      const x = padding + hour * cellWidth + cellWidth / 2;
      ctx.fillText(hour.toString(), x - 5, padding - 10);
    }

    // Draw cells
    data.forEach(({ hour, day, count }) => {
      const dayIndex = days.indexOf(day);
      if (dayIndex === -1) return;

      const x = padding + hour * cellWidth;
      const y = padding + dayIndex * cellHeight;

      // Calculate color intensity
      const intensity = count / maxCount;
      const color =
        intensity > 0 ? `rgba(59, 130, 246, ${0.1 + intensity * 0.9})` : "rgba(229, 231, 235, 0.5)";

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);

      // Draw count text for non-zero values
      if (count > 0) {
        ctx.fillStyle = intensity > 0.5 ? "#fff" : "#374151";
        ctx.font = "10px sans-serif";
        const text = count.toString();
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, x + (cellWidth - textWidth) / 2, y + cellHeight / 2 + 3);
      }
    });

    // Draw legend
    const legendY = canvas.height - 20;
    const legendWidth = 200;
    const legendHeight = 10;
    const legendX = canvas.width - legendWidth - padding;

    // Gradient legend
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, "rgba(229, 231, 235, 0.5)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels
    ctx.fillStyle = "#374151";
    ctx.font = "10px sans-serif";
    ctx.fillText("0", legendX - 10, legendY + legendHeight);
    ctx.fillText(maxCount.toString(), legendX + legendWidth + 5, legendY + legendHeight);
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}
