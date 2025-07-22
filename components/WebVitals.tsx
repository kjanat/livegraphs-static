/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useCallback, useEffect, useRef } from "react";

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

// Thresholds for each metric (in milliseconds)
const METRIC_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 } // Interaction to Next Paint
};

/**
 * Component to track and report Web Vitals
 * Sends metrics to analytics and logs performance issues
 */
export function WebVitals() {
  const metricsBuffer = useRef<WebVitalsMetric[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  const sendMetrics = useCallback((metrics: WebVitalsMetric[]) => {
    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.group("📊 Web Vitals Report");
      metrics.forEach((metric) => {
        const threshold = METRIC_THRESHOLDS[metric.name as keyof typeof METRIC_THRESHOLDS];
        const emoji = metric.rating === "good" ? "✅" : metric.rating === "poor" ? "❌" : "⚠️";

        console.log(
          `${emoji} ${metric.name}: ${metric.value.toFixed(2)}${
            metric.name === "CLS" ? "" : "ms"
          } (${metric.rating})`,
          threshold ? `[Good: <${threshold.good}, Poor: >${threshold.poor}]` : ""
        );
      });
      console.groupEnd();
    }

    // In production, send to analytics endpoint
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      const body = JSON.stringify({
        metrics,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: window.navigator.userAgent
      });

      // Use sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, body);
      } else {
        // Fallback to fetch
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
          keepalive: true
        }).catch((error) => {
          console.error("Failed to send Web Vitals:", error);
        });
      }
    }

    // Clear the buffer
    metricsBuffer.current = [];
  }, []);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      // Flush any remaining metrics
      if (metricsBuffer.current.length > 0) {
        sendMetrics(metricsBuffer.current);
      }
    };
  }, [sendMetrics]);

  useReportWebVitals((metric) => {
    // Add metric to buffer
    metricsBuffer.current.push(metric as WebVitalsMetric);

    // Track poor performance metrics immediately
    if (metric.rating === "poor") {
      console.warn(`Poor ${metric.name} detected:`, {
        value: metric.value,
        rating: metric.rating,
        url: window.location.href
      });

      // You could trigger additional logging or user feedback here
      if (metric.name === "CLS" && metric.value > 0.25) {
        console.warn("High layout shift detected. Check for dynamic content loading.");
      }
      if (metric.name === "LCP" && metric.value > 4000) {
        console.warn("Slow largest contentful paint. Consider optimizing images and fonts.");
      }
    }

    // Batch metrics and send every 5 seconds
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }

    flushTimer.current = setTimeout(() => {
      if (metricsBuffer.current.length > 0) {
        sendMetrics(metricsBuffer.current);
      }
    }, 5000);

    // Also send immediately if we have all core metrics
    const coreMetrics = ["FCP", "LCP", "CLS", "FID", "TTFB"];
    const collectedMetrics = metricsBuffer.current.map((m) => m.name);
    const hasAllCoreMetrics = coreMetrics.every((metric) => collectedMetrics.includes(metric));

    if (hasAllCoreMetrics) {
      sendMetrics(metricsBuffer.current);
    }
  });

  return null;
}
