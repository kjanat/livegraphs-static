/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { truncateToFitWidth } from "@/lib/utils/textMeasurement";

interface DynamicBarLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
  fontSize?: string | number;
  fillColor?: string;
  offsetPadding?: number;
}

/**
 * Reusable component for rendering dynamically truncated labels inside horizontal bar charts.
 * Automatically truncates text with ellipsis when it doesn't fit within the bar width.
 *
 * @example
 * <LabelList
 *   dataKey="country"
 *   content={<DynamicBarLabel />}
 *   position="insideLeft"
 * />
 */
export function DynamicBarLabel(props: DynamicBarLabelProps) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    value = "",
    fontSize = 12,
    fillColor = "white",
    offsetPadding = 8
  } = props;

  // Convert fontSize to number if it's a string
  const fontSizeNum = typeof fontSize === "number" ? fontSize : parseFloat(fontSize) || 12;

  // Convert string/number coordinates to numbers
  const xPos = typeof x === "number" ? x : parseFloat(x) || 0;
  const yPos = typeof y === "number" ? y : parseFloat(y) || 0;
  const widthNum = typeof width === "number" ? width : parseFloat(width) || 0;
  const heightNum = typeof height === "number" ? height : parseFloat(height) || 0;

  // Calculate available width (bar width minus padding)
  const padding = offsetPadding * 2;
  const availableWidth = widthNum - padding;

  // Use default browser font to match Recharts default styling
  const font = `${fontSizeNum}px sans-serif`;

  // Dynamically truncate based on available space
  const displayText = truncateToFitWidth(String(value), availableWidth, font);

  return (
    <text
      x={xPos + offsetPadding}
      y={yPos + heightNum / 2}
      fill={fillColor}
      fontSize={fontSizeNum}
      dominantBaseline="middle"
    >
      {displayText}
    </text>
  );
}
