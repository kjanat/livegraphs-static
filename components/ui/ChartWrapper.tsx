/**
 * Notso AI - Responsive Chart Wrapper
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ReactNode } from "react";
import { ExpandIcon } from "@/components/icons";

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  onExpand?: () => void;
  className?: string;
}

export function ChartWrapper({ children, title, onExpand, className = "" }: ChartWrapperProps) {
  return (
    <div
      className={`bg-card rounded-lg shadow-md p-4 sm:p-6 transition-all duration-200 hover:shadow-lg animate-in ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Expand chart"
            >
              <ExpandIcon size={18} />
            </button>
          )}
        </div>
      )}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
}

export function ResponsiveChartGrid({
  children,
  columns = 3
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) {
  const gridClass =
    columns === 2
      ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return <div className={gridClass}>{children}</div>;
}
