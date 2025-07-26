/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Standard color palette for charts
 */
export const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16" // lime
] as const;

/**
 * Default chart color (primary blue)
 */
export const DEFAULT_CHART_COLOR = CHART_COLORS[0];

/**
 * Get a color from the palette by index (wraps around if index exceeds palette length)
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Get multiple colors from the palette
 */
export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i));
}

/**
 * Common chart height classes
 */
export const CHART_HEIGHTS = {
  sm: "h-48",
  md: "h-64",
  lg: "h-80",
  xl: "h-96"
} as const;

/**
 * Common chart configurations
 */
export const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  borderRadius: 4,
  borderWidth: 1
} as const;
