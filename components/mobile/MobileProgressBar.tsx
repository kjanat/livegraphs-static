/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

interface MobileProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: "primary" | "green" | "red" | "purple" | "blue" | "orange";
  showPercentage?: boolean;
}

export function MobileProgressBar({
  label,
  value,
  max,
  color = "primary",
  showPercentage = true
}: MobileProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "red":
        return "bg-red-500";
      case "purple":
        return "bg-purple-500";
      case "blue":
        return "bg-blue-500";
      case "orange":
        return "bg-orange-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium truncate mr-2">{label}</span>
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {showPercentage ? `${percentage.toFixed(0)}%` : value.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 ${getColorClasses()} relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Add a subtle gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}
