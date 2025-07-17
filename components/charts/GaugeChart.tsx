"use client";

import { useEffect, useRef } from "react";

interface GaugeChartProps {
  value: number | null;
  max?: number;
  title?: string;
  label?: string;
}

export function GaugeChart({
  value,
  max = 5,
  title = "Average Rating",
  label = "stars"
}: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || value === null) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 30;
    ctx.strokeStyle = "#E5E7EB";
    ctx.stroke();

    // Calculate angle for value
    const percentage = value / max;
    const angle = Math.PI + Math.PI * percentage;

    // Draw value arc with gradient
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);

    if (percentage < 0.4) {
      gradient.addColorStop(0, "#EF4444");
      gradient.addColorStop(1, "#F87171");
    } else if (percentage < 0.7) {
      gradient.addColorStop(0, "#F59E0B");
      gradient.addColorStop(1, "#FBBF24");
    } else {
      gradient.addColorStop(0, "#10B981");
      gradient.addColorStop(1, "#34D399");
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, angle, false);
    ctx.lineWidth = 30;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw ticks
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#9CA3AF";
    for (let i = 0; i <= max; i++) {
      const tickAngle = Math.PI + (Math.PI * i) / max;
      const x1 = centerX + (radius - 35) * Math.cos(tickAngle);
      const y1 = centerY + (radius - 35) * Math.sin(tickAngle);
      const x2 = centerX + (radius - 25) * Math.cos(tickAngle);
      const y2 = centerY + (radius - 25) * Math.sin(tickAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw labels
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#6B7280";
      ctx.textAlign = "center";
      const labelX = centerX + (radius - 50) * Math.cos(tickAngle);
      const labelY = centerY + (radius - 50) * Math.sin(tickAngle) + 5;
      ctx.fillText(i.toString(), labelX, labelY);
    }

    // Draw value text
    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "#1F2937";
    ctx.textAlign = "center";
    ctx.fillText(value.toFixed(1), centerX, centerY - 10);

    // Draw label
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(label, centerX, centerY + 15);
  }, [value, max, label]);

  if (value === null) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div className="text-center text-gray-500 py-12">No rating data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="w-full"
        style={{ maxWidth: "300px", margin: "0 auto", display: "block" }}
      />
    </div>
  );
}
