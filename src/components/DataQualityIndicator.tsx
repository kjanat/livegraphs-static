/**
 * Notso AI - Data Quality Indicator Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { Metrics } from "@/lib/types/session";

interface DataQualityIndicatorProps {
  metrics: Metrics;
  totalSessions: number;
  dateRange: { start: Date; end: Date };
}

interface QualityIssue {
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export function DataQualityIndicator({
  metrics,
  totalSessions,
  dateRange
}: DataQualityIndicatorProps) {
  const issues: QualityIssue[] = [];

  // Sample size analysis
  if (totalSessions < 10) {
    issues.push({
      type: "error",
      title: "Very Small Sample Size",
      description: `Only ${totalSessions} conversations available. Results may not be statistically significant.`,
      impact: "high"
    });
  } else if (totalSessions < 50) {
    issues.push({
      type: "warning",
      title: "Small Sample Size",
      description: `${totalSessions} conversations may limit insight reliability. Consider larger datasets.`,
      impact: "medium"
    });
  }

  // Time range analysis
  const daysDiff = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgPerDay = totalSessions / Math.max(daysDiff, 1);

  if (daysDiff < 3) {
    issues.push({
      type: "info",
      title: "Short Time Period",
      description: `Analysis covers only ${daysDiff} day(s). Trends may not represent typical patterns.`,
      impact: "medium"
    });
  }

  if (avgPerDay < 2) {
    issues.push({
      type: "warning",
      title: "Low Activity Volume",
      description: `Average of ${avgPerDay.toFixed(1)} conversations per day suggests low usage.`,
      impact: "low"
    });
  }

  // Response time quality
  const avgResponseTime = metrics["Avg. Response Time (sec)"];
  if (avgResponseTime > 10) {
    issues.push({
      type: "warning",
      title: "Slow Response Times",
      description: `Average response time of ${avgResponseTime.toFixed(1)}s may impact user experience.`,
      impact: "medium"
    });
  }

  // Resolution rate quality
  const resolvedPercentage = metrics["Resolved Chats (%)"];
  if (resolvedPercentage < 60) {
    issues.push({
      type: "warning",
      title: "Low Resolution Rate",
      description: `Only ${resolvedPercentage.toFixed(1)}% of conversations are resolved successfully.`,
      impact: "high"
    });
  }

  // No issues case
  if (issues.length === 0) {
    issues.push({
      type: "info",
      title: "Good Data Quality",
      description: "Dataset appears sufficient for reliable analysis and insights.",
      impact: "low"
    });
  }

  const getIssueIcon = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle size={16} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "info":
        return issues.length === 1 ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <Info size={16} className="text-blue-500" />
        );
    }
  };

  const getIssueColors = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "warning":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
      case "info":
        return issues.length === 1
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  const getTextColors = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-amber-800 dark:text-amber-200";
      case "info":
        return issues.length === 1
          ? "text-green-800 dark:text-green-200"
          : "text-blue-800 dark:text-blue-200";
    }
  };

  const getImpactBadge = (impact: QualityIssue["impact"]) => {
    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[impact]}`}>{impact} impact</span>
    );
  };

  // Only show if there are significant issues or if sample size is very small
  const shouldShow = issues.some(
    (issue) =>
      issue.type === "error" ||
      (issue.type === "warning" && issue.impact === "high") ||
      totalSessions < 30
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <section className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Info size={24} className="text-muted-foreground" />
        Data Quality Assessment
      </h2>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div
            key={`${issue.type}-${issue.title}-${index}`}
            className={`border rounded-lg p-4 ${getIssueColors(issue.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIssueIcon(issue.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${getTextColors(issue.type)}`}>{issue.title}</h3>
                  {getImpactBadge(issue.impact)}
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <strong>Data Summary:</strong> {totalSessions} conversations across {daysDiff} day(s) (
        {avgPerDay.toFixed(1)} per day average)
      </div>
    </section>
  );
}
