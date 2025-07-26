/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ChartData, ChartOptions, ChartType } from "chart.js";

/**
 * Base props for all chart components
 */
export interface BaseChartProps {
  title?: string;
  className?: string;
}

/**
 * Props for charts that accept raw data
 */
export interface DataChartProps<T = unknown> extends BaseChartProps {
  data: T[];
}

/**
 * Props for charts using Chart.js data structure
 */
export interface ChartJsProps<T extends ChartType> extends BaseChartProps {
  data: ChartData<T>;
  options?: ChartOptions<T>;
}

/**
 * Common statistical metrics
 */
export interface ChartStatistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Color configuration for charts
 */
export interface ChartColorConfig {
  primary?: string;
  secondary?: string;
  background?: string;
  border?: string;
}

/**
 * Chart dimension configuration
 */
export interface ChartDimensions {
  height?: "sm" | "md" | "lg" | "xl" | string;
  width?: "full" | "auto" | string;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: Date | string;
  value: number;
  label?: string;
}

/**
 * Category data point
 */
export interface CategoryDataPoint {
  category: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}
