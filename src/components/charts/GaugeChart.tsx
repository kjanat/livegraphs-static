/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useDragGauge } from "@/lib/hooks/useDragGauge";
import { useTheme } from "@/lib/hooks/useTheme";
import { GaugeDisplay } from "./GaugeDisplay";

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
  const { isDark } = useTheme();
  const { percentage, rating, mode, startDrag, keyAdjust, setHovered } = useDragGauge(value, max);

  // Fix null/zero value handling bug - check for null specifically, not zero
  if (value == null) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
        <div className="text-center text-muted-foreground py-12">No rating data available</div>
      </div>
    );
  }

  const isDragging = mode === "drag";
  const isInteracting = mode === "hover" || mode === "drag";

  return (
    <div
      className={`bg-card rounded-lg shadow-md p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
        isDragging ? "cursor-grabbing" : "cursor-pointer"
      } ${isInteracting ? "transform hover:scale-[1.02]" : ""}`}
      data-gauge-container
    >
      <h3 className="text-xl font-bold mb-2 text-card-foreground">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          className="w-full max-w-[450px] relative bg-transparent border-none p-0 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-lg"
          onPointerDown={startDrag}
          onKeyDown={keyAdjust}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={max}
          aria-valuenow={rating}
          aria-label={`${title}: ${value.toFixed(1)} out of ${max} stars. Use arrow keys or drag to explore different values.`}
          tabIndex={0}
        >
          <GaugeDisplay
            percentage={percentage}
            value={value}
            max={max}
            mode={mode}
            isDark={isDark}
            label={label}
          />
        </button>
      </div>
    </div>
  );
}
