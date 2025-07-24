/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GaugeChartShadcnAltProps {
  value: number;
  max?: number;
  title?: string;
  description?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  className?: string;
}

export function GaugeChartShadcnAlt({
  value,
  max = 100,
  title,
  description,
  label,
  size = "md",
  showPercentage = true,
  className
}: GaugeChartShadcnAltProps) {
  // Ensure value is within bounds
  const clampedValue = Math.min(max, Math.max(0, value));
  const percentage = (clampedValue / max) * 100;

  // Size configurations
  const sizes = {
    sm: { width: 120, strokeWidth: 8, fontSize: "text-xl" },
    md: { width: 180, strokeWidth: 12, fontSize: "text-3xl" },
    lg: { width: 240, strokeWidth: 16, fontSize: "text-4xl" }
  };

  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getColor = (pct: number) => {
    if (pct >= 80) return "stroke-green-500";
    if (pct >= 60) return "stroke-yellow-500";
    if (pct >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const color = getColor(percentage);

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader className="text-center pb-2">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center">
        <div className="relative" style={{ width, height: width / 2 + 20 }}>
          <svg
            width={width}
            height={width / 2 + 20}
            viewBox={`0 0 ${width} ${width / 2 + 20}`}
            className=""
            role="img"
            aria-label={`Gauge showing ${showPercentage ? `${Math.round(percentage)}%` : clampedValue.toFixed(1)}`}
          >
            <title>{`Gauge: ${showPercentage ? `${Math.round(percentage)}%` : clampedValue.toFixed(1)}`}</title>
            {/* Background arc */}
            <path
              d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="stroke-muted"
            />

            {/* Progress arc */}
            <path
              d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn("transition-all duration-500 ease-out", color)}
            />
          </svg>

          {/* Value display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{ marginTop: "-20px" }}>
              <div className={cn("font-bold tabular-nums", fontSize)}>
                {showPercentage ? `${Math.round(percentage)}%` : clampedValue.toFixed(1)}
              </div>
              {label && <div className="text-sm text-muted-foreground mt-1">{label}</div>}
            </div>
          </div>
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between w-full mt-2 px-2 text-xs text-muted-foreground">
          <span>0</span>
          <span>{max}</span>
        </div>
      </CardContent>
    </Card>
  );
}
