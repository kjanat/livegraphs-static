/**
 * Notso AI - Loading skeleton components
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

// Common styling constants
const CARD_CLASSES = "bg-card rounded-lg shadow-md p-6 animate-in fade-in duration-500";
const SECONDARY_CLASSES = "bg-secondary p-4 rounded";
const PULSE_CLASSES = "animate-pulse rounded-md bg-muted";

// Common interfaces
interface BaseSkeletonProps {
  className?: string;
  "aria-label"?: string;
}

interface MetricsSkeletonProps {
  skeletonCount?: number;
  "aria-live"?: "polite" | "assertive" | "off";
}

interface TableSkeletonProps {
  rowCount?: number;
  "aria-label"?: string;
}

export function Skeleton({
  className = "",
  "aria-label": ariaLabel = "Loading"
}: BaseSkeletonProps) {
  return <div className={`${PULSE_CLASSES} ${className}`} role="status" aria-label={ariaLabel} />;
}

export function ChartSkeleton({
  "aria-label": ariaLabel = "Loading chart"
}: BaseSkeletonProps = {}) {
  return (
    <output className={CARD_CLASSES} aria-label={ariaLabel}>
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </output>
  );
}

export function MetricsSkeleton({
  skeletonCount = 8,
  "aria-live": ariaLive = "polite"
}: MetricsSkeletonProps = {}) {
  const skeletons = Array.from({ length: skeletonCount }, (_, index) => index);

  return (
    <output
      className={`${CARD_CLASSES} mb-8`}
      aria-busy="true"
      aria-live={ariaLive}
      aria-label="Loading metrics"
    >
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skeletons.map((index) => (
          <div key={`metric-skeleton-${index}`} className={SECONDARY_CLASSES}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </output>
  );
}

export function TableSkeleton({
  rowCount = 5,
  "aria-label": ariaLabel = "Loading table data"
}: TableSkeletonProps = {}) {
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <output className={CARD_CLASSES} aria-busy="true" aria-label={ariaLabel}>
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        {rows.map((index) => (
          <div
            key={`table-row-skeleton-${index}`}
            className={`flex justify-between items-center p-3 ${SECONDARY_CLASSES}`}
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </output>
  );
}
