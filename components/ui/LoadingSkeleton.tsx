/**
 * Notso AI - Loading skeleton components
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 animate-in fade-in duration-500">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function MetricsSkeleton() {
  const skeletonCount = 8;
  const skeletons = Array.from({ length: skeletonCount }, (_, index) => index);

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skeletons.map((index) => (
          <div key={`metric-skeleton-${index}`} className="bg-secondary p-4 rounded">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  const rowCount = 5;
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <div className="bg-card rounded-lg shadow-md p-6 animate-in fade-in duration-500">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        {rows.map((index) => (
          <div
            key={`table-row-skeleton-${index}`}
            className="flex justify-between items-center p-3 bg-secondary rounded"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
