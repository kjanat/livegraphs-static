/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false });

type GaugeMode = "idle" | "hover" | "drag" | "spring";

interface GaugeDisplayProps {
  percentage: number;
  value: number;
  max: number;
  mode: GaugeMode;
  isDark: boolean;
  label?: string;
}

const RATING_DESCRIPTIONS = {
  4.5: "Excellent",
  3.5: "Good",
  2.5: "Average",
  1.5: "Poor",
  0: "Very Poor"
} as const;

const COLOR_ARRAY = [
  "#DC2626", // Vibrant Red
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#16A34A" // Dark Green
];

function getRatingDescription(val: number): string {
  for (const [threshold, description] of Object.entries(RATING_DESCRIPTIONS)) {
    if (val >= Number(threshold)) {
      return description;
    }
  }
  return RATING_DESCRIPTIONS[0];
}

export function GaugeDisplay({
  percentage,
  value,
  max,
  mode,
  isDark,
  label = "stars"
}: GaugeDisplayProps) {
  const isInteracting = mode === "hover" || mode === "drag";
  const isDragging = mode === "drag";
  const isReturning = mode === "spring";

  // Memoized configurations
  const tickLabels = useMemo(
    () => ({
      type: "inner" as const,
      ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
      defaultTickValueConfig: {
        formatTextValue: (val: string) => {
          const num = parseFloat(val);
          if (num === 0) return "1";
          if (num === 25) return "2";
          if (num === 50) return "3";
          if (num === 75) return "4";
          if (num === 100) return "5";
          return "";
        },
        style: {
          fontSize: "10px",
          fill: isDark ? "#9CA3AF" : "#6B7280"
        }
      }
    }),
    [isDark]
  );

  const valueLabel = useMemo(
    () => ({
      formatTextValue: () => value.toFixed(1),
      style: {
        fontSize: "24px",
        fill: isDark ? "#ededed" : "#1F2937",
        fontWeight: "bold",
        textShadow: "none"
      }
    }),
    [value, isDark]
  );

  const arcConfig = useMemo(
    () => ({
      colorArray: COLOR_ARRAY,
      subArcs: [
        { limit: 20, color: COLOR_ARRAY[0] },
        { limit: 40, color: COLOR_ARRAY[1] },
        { limit: 60, color: COLOR_ARRAY[2] },
        { limit: 80, color: COLOR_ARRAY[3] },
        { limit: 100, color: COLOR_ARRAY[4] }
      ],
      padding: 0.02,
      width: isInteracting ? 0.25 : 0.2,
      gradient: true
    }),
    [isInteracting]
  );

  const pointerConfig = useMemo(
    () => ({
      type: "arrow" as const,
      animationDuration: isDragging ? 0.1 : isReturning ? 0.8 : isInteracting ? 0.6 : 0.8,
      animationDelay: isReturning ? 0 : 0.1,
      width: isDragging ? 30 : isInteracting ? 25 : 20,
      color: isDragging ? "#F59E0B" : isDark ? "#8B5CF6" : "#7C3AED",
      elastic: isReturning,
      length: isDragging ? 0.9 : 0.8
    }),
    [isDragging, isReturning, isInteracting, isDark]
  );

  return (
    <>
      <GaugeComponent
        id="gauge-component"
        value={percentage}
        type="semicircle"
        marginInPercent={{
          top: 0.08,
          bottom: 0.0,
          left: 0.08,
          right: 0.08
        }}
        labels={{
          tickLabels,
          valueLabel
        }}
        arc={arcConfig}
        pointer={pointerConfig}
      />

      {/* Information display */}
      <div className="text-center mt-3 space-y-2">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div
          className={`text-lg font-semibold transition-all duration-300 ${
            isInteracting ? "scale-110" : ""
          } ${isDragging ? "text-amber-500" : ""}`}
        >
          {getRatingDescription(value)}
        </div>
        {isInteracting && (
          <div className="text-xs text-muted-foreground animate-in fade-in duration-300">
            {value.toFixed(1)} out of {max} stars
            {isDragging && (
              <span className="block text-amber-500 font-medium">
                Drag to explore • Release to return
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      {isInteracting && (
        <div
          className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse pointer-events-none"
          style={{ transform: "scale(0.8)" }}
        />
      )}
    </>
  );
}
