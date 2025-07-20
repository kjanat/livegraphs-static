/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useCallback, useEffect, useRef } from "react";

interface GaugeChartProps {
  value: number | null;
  max?: number;
  title?: string;
  label?: string;
}

function GaugeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function GaugeChart({
  value,
  max = 5,
  title = "Average Rating",
  label = "stars"
}: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGauge = useCallback(() => {
    if (!canvasRef.current || value === null || value === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains("dark");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 10;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 30;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = isDarkMode ? "#404040" : "#E5E7EB";
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
    ctx.lineWidth = 20;
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // Draw ticks
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDarkMode ? "#6B7280" : "#9CA3AF";
    for (let i = 0; i <= max; i++) {
      const tickAngle = Math.PI + (Math.PI * i) / max;
      const x1 = centerX + (radius - 25) * Math.cos(tickAngle);
      const y1 = centerY + (radius - 25) * Math.sin(tickAngle);
      const x2 = centerX + (radius - 15) * Math.cos(tickAngle);
      const y2 = centerY + (radius - 15) * Math.sin(tickAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw labels
      ctx.font = "11px sans-serif";
      ctx.fillStyle = isDarkMode ? "#a3a3a3" : "#6B7280";
      ctx.textAlign = "center";
      const labelX = centerX + (radius - 35) * Math.cos(tickAngle);
      const labelY = centerY + (radius - 35) * Math.sin(tickAngle) + 4;
      ctx.fillText(i.toString(), labelX, labelY);
    }

    // Draw pointer/needle
    const pointerAngle = Math.PI + Math.PI * percentage;
    const pointerLength = radius - 10;
    const pointerWidth = 6;

    // Draw pointer shadow
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(pointerAngle + Math.PI / 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.moveTo(0, -pointerLength + 2);
    ctx.lineTo(-pointerWidth + 1, 10);
    ctx.lineTo(pointerWidth - 1, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw pointer
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(pointerAngle + Math.PI / 2);

    // Pointer gradient
    const pointerGradient = ctx.createLinearGradient(-pointerWidth, 0, pointerWidth, 0);
    pointerGradient.addColorStop(0, isDarkMode ? "#6B7280" : "#374151");
    pointerGradient.addColorStop(0.5, isDarkMode ? "#9CA3AF" : "#6B7280");
    pointerGradient.addColorStop(1, isDarkMode ? "#6B7280" : "#374151");

    ctx.fillStyle = pointerGradient;
    ctx.beginPath();
    ctx.moveTo(0, -pointerLength);
    ctx.lineTo(-pointerWidth, 8);
    ctx.lineTo(pointerWidth, 8);
    ctx.closePath();
    ctx.fill();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? "#4B5563" : "#6B7280";
    ctx.fill();
    ctx.strokeStyle = isDarkMode ? "#9CA3AF" : "#D1D5DB";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Draw value text below the gauge
    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = isDarkMode ? "#ededed" : "#1F2937";
    ctx.textAlign = "center";
    ctx.fillText(value.toFixed(1), centerX, centerY + radius + 35);

    // Draw label
    ctx.font = "13px sans-serif";
    ctx.fillStyle = isDarkMode ? "#a3a3a3" : "#6B7280";
    ctx.fillText(label, centerX, centerY + radius + 52);
  }, [value, max, label]);

  useEffect(() => {
    drawGauge();
  }, [drawGauge]);

  // Re-render when dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      drawGauge();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, [drawGauge]);

  if (value === null || value === 0) {
    return (
      <GaugeCard title={title}>
        <div className="text-center text-muted-foreground py-12">No rating data available</div>
      </GaugeCard>
    );
  }

  return (
    <GaugeCard title={title}>
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="w-full"
        style={{ maxWidth: "300px", margin: "0 auto", display: "block" }}
      />
    </GaugeCard>
  );
}
