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
 * Wrapper component that only renders charts when they're in the viewport
 * Improves initial page load performance by deferring off-screen chart rendering
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
