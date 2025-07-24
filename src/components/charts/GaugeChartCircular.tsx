/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GaugeChartCircularProps {
  value: number;
  max?: number;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  thickness?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  segments?: {
    threshold: number;
    color: string;
    label: string;
  }[];
}

export function GaugeChartCircular({
  value,
  max = 100,
  title,
  subtitle,
  size = "md",
  thickness = 0.15,
  showValue = true,
  formatValue = (val) => `${Math.round((val / max) * 100)}%`,
  segments = [
    { threshold: 25, color: "rgb(239, 68, 68)", label: "Low" },
    { threshold: 50, color: "rgb(251, 146, 60)", label: "Medium" },
    { threshold: 75, color: "rgb(250, 204, 21)", label: "Good" },
    { threshold: 100, color: "rgb(34, 197, 94)", label: "Excellent" }
  ]
}: GaugeChartCircularProps) {
  const sizes = {
    sm: 160,
    md: 200,
    lg: 240
  };

  const diameter = sizes[size];
  const radius = diameter / 2;
  const innerRadius = radius * (1 - thickness);
  const center = diameter / 2;

  // Calculate angles (270 degree gauge)
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const valueAngle = startAngle + (percentage / 100) * totalAngle;

  // Get color based on segments
  const getSegmentColor = (val: number) => {
    const pct = (val / max) * 100;
    for (const segment of [...segments].reverse()) {
      if (pct <= segment.threshold) {
        return segment.color;
      }
    }
    return segments[segments.length - 1].color;
  };

  const currentColor = getSegmentColor(value);

  // Create paths
  const createPath = (startDeg: number, endDeg: number, r: number, innerR: number) => {
    const start = polarToCartesian(center, center, r, endDeg);
    const end = polarToCartesian(center, center, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? "0" : "1";

    const outerArc = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    const innerArcStart = polarToCartesian(center, center, innerR, startDeg);
    const innerArcEnd = polarToCartesian(center, center, innerR, endDeg);
    const innerArc = `L ${innerArcStart.x} ${innerArcStart.y} A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${innerArcEnd.x} ${innerArcEnd.y}`;

    return `${outerArc} ${innerArc} Z`;
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    r: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  // Create segment paths
  const segmentPaths = segments.map((segment, index) => {
    const prevThreshold = index === 0 ? 0 : segments[index - 1].threshold;
    const segStartAngle = startAngle + (prevThreshold / 100) * totalAngle;
    const segEndAngle = startAngle + (segment.threshold / 100) * totalAngle;

    return {
      path: createPath(segStartAngle, segEndAngle, radius - 2, innerRadius + 2),
      color: segment.color,
      label: segment.label
    };
  });

  const valuePath = createPath(startAngle, valueAngle, radius, innerRadius);

  return (
    <Card className="w-full">
      {title && (
        <CardHeader className="text-center pb-2">
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center">
        <div className="relative" style={{ width: diameter, height: diameter }}>
          <svg
            width={diameter}
            height={diameter}
            role="img"
            aria-label={`Gauge chart showing ${formatValue(value)}`}
          >
            <title>{`Gauge chart: ${formatValue(value)}`}</title>
            {/* Background segments */}
            {segmentPaths.map((segment) => (
              <path
                key={`bg-${segment.label}`}
                d={segment.path}
                fill={segment.color}
                opacity={0.2}
              />
            ))}

            {/* Value arc */}
            <path
              d={valuePath}
              fill={currentColor}
              className="transition-all duration-700 ease-out"
            />

            {/* Center circle */}
            <circle cx={center} cy={center} r={innerRadius - 4} className="fill-background" />
          </svg>

          {/* Center content */}
          {showValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={cn(
                  "font-bold tabular-nums",
                  size === "sm" ? "text-2xl" : size === "md" ? "text-3xl" : "text-4xl"
                )}
              >
                {formatValue(value)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {value.toFixed(1)} / {max}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {segments.map((segment) => (
            <div key={`legend-${segment.label}`} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-muted-foreground">{segment.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
