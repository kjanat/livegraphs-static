/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

interface MobileMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: "primary" | "green" | "red" | "purple" | "blue" | "orange";
}

export function MobileMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = "primary"
}: MobileMetricCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "red":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "purple":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      case "orange":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-border/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-muted-foreground truncate">{title}</h3>
          <p className="text-xl font-bold mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground/80 mt-0.5">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium mt-1 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-[14px] w-[14px]" />
              ) : (
                <TrendingDown className="h-[14px] w-[14px]" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && <div className={`p-2 rounded-md ${getColorClasses()}`}>{icon}</div>}
      </div>
    </div>
  );
}
