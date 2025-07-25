/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type ReactNode, Suspense } from "react";
import { useInViewport } from "@/hooks/useInViewport";
import { ChartErrorBoundary } from "./ChartErrorBoundary";
import { ChartSkeleton } from "./skeleton";

interface LazyChartProps {
  children: ReactNode;
  chartName?: string;
  minHeight?: number;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Defers rendering of chart components until they enter the viewport, displaying a skeleton placeholder while off-screen.
 *
 * Enhances performance by avoiding unnecessary rendering of charts that are not visible. When the chart container enters the viewport, the chart is rendered inside an error boundary and supports lazy loading with a fallback skeleton.
 *
 * @param children - The chart component(s) to render when visible
 * @param chartName - Optional name for error boundary identification
 * @param minHeight - Minimum height of the container in pixels; defaults to 400
 * @param threshold - Intersection threshold for viewport detection; defaults to 0.1
 * @param rootMargin - Margin around the viewport for intersection detection; defaults to "100px"
 */
export function LazyChart({
  children,
  chartName,
  minHeight = 400,
  threshold = 0.1,
  rootMargin = "100px"
}: LazyChartProps) {
  const [ref, isInViewport] = useInViewport<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce: true
  });

  return (
    <div ref={ref} style={{ minHeight: `${minHeight}px` }}>
      {isInViewport ? (
        <ChartErrorBoundary chartName={chartName}>
          <Suspense fallback={<ChartSkeleton height={minHeight} />}>{children}</Suspense>
        </ChartErrorBoundary>
      ) : (
        <ChartSkeleton height={minHeight} />
      )}
    </div>
  );
}
