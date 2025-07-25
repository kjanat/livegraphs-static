/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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

/**
 * Renders a circular gauge chart inside a card, visualizing a numeric value relative to a maximum with color-coded segments and labels.
 *
 * Displays the value as a donut-shaped arc, segmented by customizable thresholds, with optional title, subtitle, and legend. The chart is accessible and responsive to different sizes and formatting options.
 *
 * @param value - The current value to display on the gauge.
 * @param max - The maximum value for scaling the gauge (default is 100).
 * @param title - Optional title displayed in the card header.
 * @param subtitle - Optional subtitle displayed below the title.
 * @param size - Size of the gauge ("sm", "md", or "lg"; default is "md").
 * @param thickness - Thickness ratio of the gauge arc (default is 0.15).
 * @param showValue - Whether to display the formatted value in the center (default is true).
 * @param formatValue - Function to format the displayed value (default formats as percentage).
 * @param segments - Array defining threshold percentages, colors, and labels for gauge segments.
 *
 * @returns A card component containing the circular gauge chart and legend.
 */
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

  // Get current segment for legend
  const getCurrentSegment = () => {
    const pct = (value / max) * 100;
    return (
      [...segments].reverse().find((segment) => pct <= segment.threshold) ||
      segments[segments.length - 1]
    );
  };

  const currentSegment = getCurrentSegment();

  return (
    <Card className="h-full flex flex-col">
      {title && (
        <CardHeader className="pb-0">
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">
        <div className="flex items-center justify-center h-full">
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
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none text-center">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentSegment.color }}
            />
            <span>{currentSegment.label} rating</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
