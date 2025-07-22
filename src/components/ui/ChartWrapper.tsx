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
              <ExpandIcon size={18} decorative />
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
