/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { ReactNode } from "react";
import { memo } from "react";

interface ChartWrapperProps {
  title: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export const ChartWrapper = memo(
  ({
    title,
    children,
    isEmpty = false,
    emptyMessage = "No data available",
    className = "",
    titleClassName = "",
    contentClassName = ""
  }: ChartWrapperProps) => {
    return (
      <div className={`bg-card rounded-lg shadow-md p-6 ${className}`}>
        <h3 className={`text-xl font-bold mb-4 text-card-foreground ${titleClassName}`}>{title}</h3>
        {isEmpty ? (
          <div className="text-center text-muted-foreground py-12">{emptyMessage}</div>
        ) : (
          <div className={contentClassName}>{children}</div>
        )}
      </div>
    );
  }
);

ChartWrapper.displayName = "ChartWrapper";
