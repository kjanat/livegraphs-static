/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

/**
 * React hook that monitors and logs component render performance metrics during development.
 *
 * Tracks the number of renders, last and average render times, and counts of slow renders exceeding a specified threshold. Logs warnings for slow renders and periodic summaries to the console. Has no effect in production environments.
 *
 * @param componentName - The display name of the component being monitored
 * @param threshold - The render time threshold in milliseconds to classify a render as slow (default: 16)
 */
export function usePerformanceMonitor(componentName: string, threshold = 16) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  });

  const renderStartRef = useRef<number>(0);
  const isDevelopment = process.env.NODE_ENV === "development";

  // Track render start time
  if (isDevelopment) {
    renderStartRef.current = performance.now();
  }

  useEffect(() => {
    // Skip metrics in production
    if (!isDevelopment) {
      return;
    }

    const renderTime = performance.now() - renderStartRef.current;
    const metrics = metricsRef.current;

    // Update metrics
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime =
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    if (renderTime > threshold) {
      metrics.slowRenders++;
      console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`, {
        renderCount: metrics.renderCount,
        averageTime: metrics.averageRenderTime.toFixed(2),
        slowRenders: metrics.slowRenders
      });
    }

    // Log summary every 10 renders
    if (metrics.renderCount % 10 === 0) {
      console.log(`[Performance] ${componentName} summary:`, {
        renders: metrics.renderCount,
        avgTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        slowRenders: metrics.slowRenders,
        slowRate: `${((metrics.slowRenders / metrics.renderCount) * 100).toFixed(1)}%`
      });
    }
  }, [componentName, threshold, isDevelopment]);
}
