/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface ChartSkeletonProps {
  className?: string;
  height?: number | string;
}

export function ChartSkeleton({ className = "", height = 300 }: ChartSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-card rounded-lg border shadow-sm p-6 ${className}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div className="h-4 bg-muted rounded w-3/4 mb-4" />
      <div className="h-3 bg-muted rounded w-1/2 mb-6" />
      <div className="relative h-full">
        <div className="absolute inset-0 bg-muted rounded opacity-50" />
      </div>
    </div>
  );
}
