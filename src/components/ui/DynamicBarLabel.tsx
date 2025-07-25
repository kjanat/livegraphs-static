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
 * Renders a text label inside a horizontal bar chart, automatically truncating the label with an ellipsis if it exceeds the available width.
 *
 * The label is vertically centered within the bar and styled according to the provided font size and fill color. Padding can be adjusted to control spacing from the bar edges.
 *
 * @param props - Properties specifying label position, size, content, styling, and padding
 * @returns An SVG `<text>` element with the truncated label
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
