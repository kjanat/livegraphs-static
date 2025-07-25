/**
 * Notso AI - Responsive Chart Wrapper
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Expand } from "lucide-react";
import type { ReactNode } from "react";

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  onExpand?: () => void;
  className?: string;
}

/**
 * Renders a styled, accessible container for chart content with optional title and expand functionality.
 *
 * Displays a header with the provided title and, if an expand callback is supplied, an accessible expand button. The chart content is rendered within a responsive, visually distinct card layout.
 *
 * @param children - The chart content to display within the wrapper.
 * @param title - Optional title displayed above the chart.
 * @param onExpand - Optional callback invoked when the expand button is clicked.
 * @param className - Optional additional CSS classes for the container.
 */
export function ChartWrapper({ children, title, onExpand, className = "" }: ChartWrapperProps) {
  // Generate a unique ID for the heading to use with aria-labelledby
  const headingId = title ? `chart-title-${title.toLowerCase().replace(/\s+/g, "-")}` : undefined;

  return (
    <div
      className={`bg-card rounded-lg shadow-md p-4 sm:p-6 transition-all duration-200 hover:shadow-lg animate-in ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 id={headingId} className="text-lg sm:text-xl font-bold">
            {title}
          </h3>
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="p-2 hover:bg-secondary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-labelledby={headingId}
              aria-describedby={`${headingId}-expand-desc`}
            >
              <Expand className="h-[18px] w-[18px]" />
              <span id={`${headingId}-expand-desc`} className="sr-only">
                Expand to fullscreen
              </span>
            </button>
          )}
        </div>
      )}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
}
