/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { AlertCircle, CheckCircle, Info, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import type { Metrics } from "@/lib/types/session";

interface MobileHighlightsProps {
  metrics: Metrics;
}

/**
 * Displays key chatbot conversation insights and highlights based on provided metrics.
 *
 * Renders a summary of important trends such as resolution rate and user satisfaction, with contextual icons and styling. Allows users to dismiss the highlights panel.
 *
 * @param metrics - The metrics object containing conversation statistics and ratings used to generate highlights.
 */
export function MobileHighlights({ metrics }: MobileHighlightsProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const highlights = [];
  const lastUpdated = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Calculate resolution rate
  const totalConversations = metrics["Total Conversations"];
  const resolutionRate = Number(metrics["Resolved Chats (%)"]) || 0;

  // High resolution rate
  if (Number(resolutionRate) > 80) {
    highlights.push({
      type: "success" as const,
      title: "High Resolution Rate",
      message: `${resolutionRate}% of conversations resolved successfully`,
      icon: <CheckCircle className="h-5 w-5" />
    });
  }

  // Low resolution rate warning
  if (Number(resolutionRate) < 50) {
    highlights.push({
      type: "warning" as const,
      title: "Low Resolution Rate",
      message: `Only ${resolutionRate}% of conversations were resolved`,
      icon: <AlertCircle className="h-5 w-5" />
    });
  }

  // Note: Escalation rate would need to be calculated from chart data
  // For now, we'll skip this highlight since it's not in the Metrics interface

  // Good average rating
  const avgRating = metrics["Avg. User Rating"];
  if (typeof avgRating === "number" && avgRating >= 4) {
    highlights.push({
      type: "success" as const,
      title: "Excellent User Satisfaction",
      message: `Average rating of ${avgRating.toFixed(1)} out of 5 stars`,
      icon: <TrendingUp className="h-5 w-5" />
    });
  }

  // Low average rating
  if (typeof avgRating === "number" && avgRating < 3) {
    highlights.push({
      type: "warning" as const,
      title: "User Satisfaction Needs Improvement",
      message: `Average rating of ${avgRating.toFixed(1)} out of 5 stars`,
      icon: <AlertCircle className="h-5 w-5" />
    });
  }

  // Add a general info if no specific highlights
  if (highlights.length === 0) {
    highlights.push({
      type: "info" as const,
      title: "Dashboard Summary",
      message: `Analyzing ${totalConversations} conversations from your dataset`,
      icon: <Info className="h-5 w-5" />
    });
  }

  const getHighlightStyles = (type: "success" | "warning" | "info") => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200";
      case "warning":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200";
    }
  };

  if (isDismissed) return null;

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold">Key Insights</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Updated {lastUpdated}</span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Dismiss insights"
          >
            <X className="h-[14px] w-[14px] text-muted-foreground" />
          </button>
        </div>
      </div>
      {highlights.map((highlight) => (
        <div
          key={`${highlight.type}-${highlight.title}`}
          className={`p-3 rounded-lg border flex items-start gap-2.5 ${getHighlightStyles(highlight.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{highlight.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs mb-0.5">{highlight.title}</h3>
            <p className="text-xs opacity-90">{highlight.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
